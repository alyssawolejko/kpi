import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'underscore';

import bem from './bem';
import {t, assign} from './utils';
import classNames from 'classnames';

var hotkey = require('react-hotkey');
hotkey.activate();

var ui = {};

ui.SearchBox = React.createClass({
  getValue () {
    return ReactDOM.findDOMNode(this.refs.inp).value;
  },
  setValue (v) {
    ReactDOM.findDOMNode(this.refs.inp).value = v;
  },
  render () {
    var elemId = _.uniqueId('elem');
    var value = this.props.value;
    return (
        <input type="text" ref='inp' className="k-search__input" value={value}
            onKeyUp={this.props.onKeyUp} onChange={this.props.onChange} id={elemId} placeholder={this.props.placeholder}/>
      );
  }
});

ui.Panel = React.createClass({
  render () {
    return (
        <bem.uiPanel className={this.props.className} m={this.props.m}>
          <bem.uiPanel__body>
            {this.props.children}
          </bem.uiPanel__body>
        </bem.uiPanel>
      );
  }
});


ui.Modal = React.createClass({
  mixins: [hotkey.Mixin('handleHotkey')],
  handleHotkey: function(evt) {
    if (evt.keyCode === 27) {
      this.props.onClose.call(evt);
    }
  },
  backdropClick (evt) {
    if (evt.currentTarget === evt.target) {
      this.props.onClose.call(evt);
    }
  },
  renderTitle () {
    if (!this.props.title) {
      return null;
    } else if (this.props.small) {
      return (
          <div>
            <h4 className="modal-title">
              {this.props.title}
            </h4>
            <h6>
              {this.props.small}
            </h6>
          </div>
        );
    } else {
      return (
          <h4 className="modal-title">
            {this.props.title}
          </h4>
        );
    }
  },
  render () {
    return (
      // m={['done', isSearch ? 'search' : 'default']}
      <div className={classNames('modal-backdrop', this.props.className,
            this.props.large ? 'modal-large' : null,
            this.props.error ? 'modal-error' : null,
            this.props.title ? 'modal-titled' : null)}
          onClick={this.backdropClick}>
        <div className={classNames(this.props.open ? 'modal-open' : 'modal', this.props.icon ? 'modal--withicon' : null)}>
          {this.props.icon ?
            <i className={classNames('modal_icon', `modal_icon--${this.props.icon}`)} />
          :null}
          <div className={classNames('modal-content')}>
            <div className="modal-header">
              {this.renderTitle()}
              <a className="modal-x" type="button" onClick={this.props.onClose}>
                <i className="k-icon-close"></i>
              </a>
            </div>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});

ui.Modal.Footer = React.createClass({
  doneClick (evt) {
    alert('done!');
    this.props.onClose.call(evt);
  },
  render () {
    return <div className="modal-footer">{this.props.children}</div>;
  }
});

ui.Modal.Body = React.createClass({
  render () {
    return <div className="modal-body">{this.props.children}</div>;
  }
});

var SidebarAssetName = bem.create('sidebar-asset-name', '<span>');

ui.SidebarAssetName = React.createClass({
  render () {
    return (
        <SidebarAssetName m={{noname: !this.props.name}}>
          {this.props.name || t('No name')}
        </SidebarAssetName>
      );
  }
});

ui.AssetName = React.createClass({
  render () {
    var name = this.props.name,
        extra = false,
        isEmpty;
    var summary = this.props.summary;
    var row_count;
    if (!name) {
      row_count = summary.row_count;
      name = summary.labels ? summary.labels[0] : false;
      if (!name) {
        isEmpty = true;
        name = t('no name');
      }
      if (row_count) {
        if (row_count === 2) {
          extra = <small>{t('and one other question')}</small>;
        } else if (row_count > 2) {
          extra = <small>{t('and ## other questions').replace('##', row_count - 1)}</small>;
        }
      }
    }
    return (
        <span className={isEmpty ? 'asset-name asset-name--empty' : 'asset-name'}>
          {name}
          {extra ?
            extra
          : null }
        </span>
      );
  }
});

ui.PopoverMenu = React.createClass({
  getInitialState () {
    return assign({
      popoverVisible: false,
      popoverHiding: false,
      placement: 'below'
    });

  },
  toggle(evt) {
    var isBlur = evt.type === 'blur',
        $popoverMenu;
    

    if (this.state.popoverVisible || isBlur) {
        $popoverMenu = $(evt.target).parents('.popover-menu').find('.popover-menu__content');
        this.setState({
          popoverHiding: true
        });
        // if we setState and immediately hide popover then links will not register as clicked
        window.setTimeout(()=>{
          if (!this.isMounted())
            return false;

          this.setState({
            popoverVisible: false,
            popoverHiding: false
          });
        }, 500);
    } else {
      this.setState({
        popoverVisible: true,
      });
    }
    // 
    if (this.props.type == 'assetrow-menu' && !this.state.popoverVisible) {
      var $assetRowOffset = $(evt.target).parents('.asset-row').offset().top;
      var $assetListHeight = $(evt.target).parents('.page-wrapper__content').height();
      if ($assetListHeight - $assetRowOffset < 250) {
        this.setState({
          placement: 'above',
        });        
      }
    }
  },
  componentWillReceiveProps(nextProps) {
    if (this.state.popoverVisible && nextProps.clearPopover) {
      this.setState({
        popoverVisible: false
      });
    }
  },
  render () {
    return (
      <bem.PopoverMenu m={[this.props.type, this.state.placement]}>
        <bem.PopoverMenu__toggle onClick={this.toggle} onBlur={this.toggle} data-tip={this.props.triggerTip} tabIndex='1'>
          {this.props.triggerLabel}
        </bem.PopoverMenu__toggle>
        <bem.PopoverMenu__content m={[this.state.popoverHiding ? 'hiding' : '', this.state.popoverVisible ? 'visible' : 'hidden']}>
          {this.props.children}
        </bem.PopoverMenu__content>
      </bem.PopoverMenu>

    );
  }
});

export default ui;
