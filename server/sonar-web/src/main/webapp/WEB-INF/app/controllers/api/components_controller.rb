#
# SonarQube, open source software quality management tool.
# Copyright (C) 2008-2014 SonarSource
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
class Api::ComponentsController < Api::ApiController

  # Do not exceed 1000 because of the Oracle limitation on IN statements
  MAX_RESULTS = 6

  # Internal WS for the top-right search engine
  def suggestions
    search = params[:s]
    bad_request("Minimum search is #{ResourceIndex::MIN_SEARCH_SIZE} characters") if search.empty? || search.to_s.size<ResourceIndex::MIN_SEARCH_SIZE

    # SONAR-5198 Escape '_' on Oracle and MsSQL
    dialect = java_facade.getDatabase().getDialect().getId()
    additional_escape = dialect == 'oracle' || dialect == 'mssql' ? "ESCAPE '\\'" : ''

    key = escape_like(search).downcase
    results = ResourceIndex.all(:select => 'distinct(component_uuid),root_component_uuid,qualifier,name_size', # optimization to not load unused columns like 'kee'
                                :conditions => ['kee like ? ' + additional_escape, key + '%'],
                                :order => 'name_size')

    results = select_authorized(:user, results)

    resource_uuids=[]
    resource_indexes_by_qualifier={}
    results.each do |resource_index|
      qualifier = fix_qualifier(resource_index.qualifier)
      resource_indexes_by_qualifier[qualifier] ||= []
      array = resource_indexes_by_qualifier[qualifier]
      if array.size < MAX_RESULTS
        resource_uuids << resource_index.component_uuid
        array << resource_index
      end
    end

    resources_by_uuid = {}
    unless resource_uuids.empty?
      Project.find(:all, :conditions => ['uuid in (?)', resource_uuids]).each do |resource|
        resources_by_uuid[resource.uuid]=resource
      end
    end

    json = {'total' => results.size}
    json_results = []
    java_facade.getResourceTypes().each do |resource_type|
      qualifier_results={}
      qualifier=resource_type.getQualifier()
      qualifier_results['q']=qualifier
      qualifier_results['icon']=resource_type.getIconPath()
      qualifier_results['name']=Api::Utils.message("qualifiers.#{qualifier}")
      resource_indexes=resource_indexes_by_qualifier[qualifier]||[]
      qualifier_results['items']=resource_indexes.map do |resource_index|
        resource=resources_by_uuid[resource_index.component_uuid]
        {
            'key' => resource.key,
            'name' => resource.name(true)
        }
      end
      json_results<<qualifier_results
    end
    json['results']=json_results

    render :json => jsonp(json)
  end

  private

  def fix_qualifier(q)
    case q
      when 'CLA' then
        'FIL'
      when 'PAC' then
        'DIR'
      else
        q
    end
  end

end
