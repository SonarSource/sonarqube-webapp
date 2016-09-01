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

#
# SonarQube 6.1
#
class CreateTableProperties2 < ActiveRecord::Migration

  def self.up
    create_table 'properties2' do |t|
      t.column 'prop_key', :string, :limit => 512, :null => false
      t.column :resource_id, :integer, :null => true
      t.column :user_id, :integer, :null => true
      t.column 'is_empty', :boolean, :null => false
	    t.column :text_value, :string, :limit => 4000, :null => true
	    t.column :clob_value, :text, :null => true
      t.column 'created_at', :big_integer, :null => false
    end
    add_varchar_index :properties2, :prop_key, :name => 'properties2_key'
  end
end
