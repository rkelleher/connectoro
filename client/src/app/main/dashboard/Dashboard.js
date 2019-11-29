import React, {Component} from "react";
import {withStyles} from "@material-ui/core/styles";
import {FusePageSimple} from "@fuse";

const styles = theme => ({
  layoutRoot: {}
});

class Dashboard extends Component {
  render() {
    const {classes} = this.props;
    return (
      <FusePageSimple
        classes={{
          root: classes.layoutRoot
        }}
        header={
          <div className="p-24">
            <h4>This is the header</h4>
          </div>
        }
        contentToolbar={
          <div className="px-24">
            <h4>This is in the toolbar!</h4>
          </div>
        }
        content={
          <div className="p-24">
            <h4>You should have to be logged in to see this!</h4>
            <br />
          </div>
        }
      />
    );
  }
}

export default withStyles(styles, {withTheme: true})(Dashboard);
