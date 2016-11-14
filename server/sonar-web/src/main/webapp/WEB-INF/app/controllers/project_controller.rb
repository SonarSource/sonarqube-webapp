#
# SonarQube, open source software quality management tool.
# Copyright (C) 2008-2016 SonarSource
# mailto:contact AT sonarsource DOT com
#
# SonarQube is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 3 of the License, or (at your option) any later version.
#
# SonarQube is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program; if not, write to the Free Software Foundation,
# Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
class ProjectController < ApplicationController

  SECTION=Navigation::SECTION_RESOURCE

  def index
    # this URL should not be called. Replaced by dashboard/index
    redirect_to :overwrite_params => {:controller => :dashboard, :action => 'index'}
  end

  def settings
      @project = get_current_project(params[:id])
    end

  def deletion
    @project = get_current_project(params[:id])
  end

  def quality_profiles
    # since 6.1
    @project = Project.by_key(params[:id])
    not_found("Project not found") unless @project
    access_denied unless (is_admin?(@project.uuid) || has_role?(:profileadmin))
  end

  def profile
    # redirect to another url since 6.1
    redirect_to(url_for({:action => 'quality_profiles'}) + '?id=' + url_encode(params[:id]))
  end

  def background_tasks
    @project = get_current_project(params[:id])
  end

  def quality_gate
    # since 6.1
    @project = get_current_project(params[:id])
  end

  def qualitygate
    # redirect to another url since 6.1
    redirect_to(url_for({:action => 'quality_gate'}) + '?id=' + url_encode(params[:id]))
  end

  def links
    @project = get_current_project(params[:id])
  end

  def key
    @project = get_current_project(params[:id])
  end

  def history
    @project = get_current_project(params[:id])

    unless java_facade.getResourceTypeBooleanProperty(@project.qualifier, 'modifiable_history')
      redirect_to :action => 'index', :id => params[:id]
    end

    @snapshot = @project.last_analysis
    @analyses = Snapshot.all(:conditions => ["status='P' AND component_uuid=?", @project.uuid],
                              :include => 'events', :order => 'snapshots.created_at DESC')
  end

  def update_version
    snapshot=Snapshot.find(params[:sid], :include => 'project')
    not_found("Snapshot not found") unless snapshot
    access_denied unless is_admin?(snapshot)

    unless params[:version_name].blank?
      if Event.already_exists(snapshot.component_uuid, params[:version_name], EventCategory::KEY_VERSION)
        flash[:error] = message('project_history.version_already_exists', :params => h(params[:version_name]))
      else
        # We update the snapshot to have a version attribute in sync with the new name
        snapshot.version = params[:version_name]
        snapshot.save!
        # And then we update/create the event on the snapshot
        if snapshot.event(EventCategory::KEY_VERSION)
          # This is an update: we update the event
          Event.update_all({:name => params[:version_name]},
                           ["category = ? AND analysis_uuid = ?", EventCategory::KEY_VERSION, snapshot.uuid])
          flash[:notice] = message('project_history.version_updated', :params => h(params[:version_name]))
        else
          # We create an event on the snapshot
          event = Event.create!(:name => params[:version_name], :snapshot => snapshot,
                                :component_uuid => snapshot.project.uuid, :category => EventCategory::KEY_VERSION,
                                :event_date => snapshot.created_at)
          flash[:notice] = message('project_history.version_created', :params => h(params[:version_name]))
        end
      end
    end

    redirect_to :action => 'history', :id => snapshot.project.id
  end

  def delete_version
    parent_snapshot=Snapshot.find(params[:sid])
    not_found("Snapshot not found") unless parent_snapshot
    access_denied unless is_admin?(parent_snapshot)

    # We update all the related snapshots to have the same version as the next snapshot
    next_snapshot = Snapshot.find(:first, :conditions => ['created_at>? and component_uuid=?', parent_snapshot.created_at_long, parent_snapshot.component_uuid], :order => 'created_at asc')
    parent_snapshot.version = next_snapshot.version
    parent_snapshot.save!

    # and we delete the events
    event = parent_snapshot.event(EventCategory::KEY_VERSION)
    old_version_name = event.name
    events = find_events(event)

    Event.transaction do
      events.map { |e| e.id }.each_slice(999) do |safe_for_oracle_ids|
        Event.delete(safe_for_oracle_ids)
      end
    end

    flash[:notice] = message('project_history.version_removed', :params => h(old_version_name))
    redirect_to :action => 'history', :id => parent_snapshot.project.id
  end

  def create_event
    snapshot=Snapshot.find(params[:sid])
    not_found("Snapshot not found") unless snapshot
    access_denied unless is_admin?(snapshot)

    if Event.already_exists(snapshot.component_uuid, params[:event_name], EventCategory::KEY_OTHER)
      flash[:error] = message('project_history.event_already_exists', :params => h(params[:event_name]))
    else
      e = Event.new({:name => params[:event_name],
                     :category => EventCategory::KEY_OTHER,
                     :snapshot => snapshot,
                     :component_uuid => snapshot.project.uuid,
                     :event_date => snapshot.created_at})
      e.save!
      flash[:notice] = message('project_history.event_created', :params => h(params[:event_name]))
    end

    redirect_to :action => 'history', :id => snapshot.project.id
  end

  def update_event
    event = Event.find(params[:id])
    not_found("Event not found") unless event
    access_denied unless is_admin?(event.resource)

    if Event.already_exists(event.component_uuid, params[:event_name], EventCategory::KEY_OTHER)
      flash[:error] = message('project_history.event_already_exists', :params => h(event.name))
    else
      events = find_events(event)
      events.each do |e|
        e.name = params[:event_name]
        e.save!
      end
      flash[:notice] = message('project_history.event_updated')
    end

    redirect_to :action => 'history', :id => event.resource.id
  end

  def delete_event
    event = Event.find(params[:id])
    not_found("Event not found") unless event
    access_denied unless is_admin?(event.resource)

    name = event.name
    resource_id = event.resource.id
    events = find_events(event)
    Event.transaction do
      events.map { |e| e.id }.each_slice(999) do |safe_for_oracle_ids|
        Event.delete(safe_for_oracle_ids)
      end
    end

    flash[:notice] = message('project_history.event_deleted', :params => h(name))
    redirect_to :action => 'history', :id => resource_id
  end

  def delete_snapshot_history
    @project = get_current_project(params[:id])

    sid = params[:snapshot_id]
    if sid
      Snapshot.update_all("status='U'", ["id=?", sid.to_i])
      flash[:notice] = message('project_history.snapshot_deleted')
    end

    redirect_to :action => 'history', :id => @project.id
  end

  protected

  def get_current_project(project_id)
    project=Project.by_key(project_id)
    not_found("Project not found") unless project
    access_denied unless is_admin?(project)
    project
  end

  # Returns all an array that contains the given event + all the events that are the same
  def find_events(event)
    events = []
    name = event.name
    category = event.category
    event.snapshot.events.reject { |e| e.name!=name || e.category!=category }.each do |event|
      events << event
    end
    events
  end

  def redirect_to_default
    redirect_to home_path
  end

end
