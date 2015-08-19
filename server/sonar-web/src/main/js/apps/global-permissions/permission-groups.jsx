import React from 'react';
import PermissionsUsersGroupsMixin from './permission-users-groups-mixin';
import GroupsView from './groups-view';

export default React.createClass({
  mixins: [PermissionsUsersGroupsMixin],

  renderUpdateLink() {
    return (
        <a onClick={this.updateGroups}
           className="icon-bullet-list"
           title="Update Groups"
           data-toggle="tooltip"
           href="#"></a>
    );
  },

  renderItem(item) {
    return item.name;
  },

  renderTitle() {
    console.log(this.props);
    return 'Groups';
  },

  updateGroups(e) {
    e.preventDefault();
    new GroupsView({
      permission: this.props.permission.key,
      refresh: this.props.refresh
    }).render();
  }
});
