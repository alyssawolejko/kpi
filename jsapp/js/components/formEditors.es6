import $ from 'jquery';
import React from 'react';
import Reflux from 'reflux';
import alertify from 'alertifyjs';

import newFormMixin from '../editorMixins/newForm';
import editableFormMixin from '../editorMixins/editableForm';
import existingFormMixin from '../editorMixins/existingForm';
import Select from 'react-select';
import ui from '../ui';
import bem from '../bem';
import DocumentTitle from 'react-document-title';

import {session} from '../stores';

let newFormMixins = [
    Reflux.ListenerMixin,
    editableFormMixin,
    newFormMixin,
];
import actions from '../actions';
import {dataInterface} from '../dataInterface';
import {
  t,
  redirectTo,
  assign,
} from '../utils';

export var ProjectSettings = React.createClass({
  mixins: [
    Reflux.ListenerMixin,
  ],
  nameChange (evt) {
    this.setState({
      name: evt.target.value
    });
  },
  descriptionChange (evt) {
    let descriptionHeight = $(evt.target).prop('scrollHeight');
    this.setState({
      description: evt.target.value,
      textareaHeight: descriptionHeight
    });
  },
  countryChange (val) {
    this.setState({
      country: val
    });
  },
  sectorChange (val) {
    this.setState({
      sector: val
    });
  },
  shareMetadataChange (evt) {
    this.setState({
      'share-metadata': evt.target.checked
    });
  },
  getInitialState () {
    let state = {
      sessionLoaded: !!session.currentAccount,
      name: '',
      description: '',
      sector: '',
      country: '',
      textareaHeight: '',
      'share-metadata': false,
    }
    if (this.props.initialData !== undefined) {
      assign(state, this.props.initialData);
    }
    return state;
  },
  componentDidMount () {
    this.listenTo(session, (session) => {
      this.setState({
        sessionLoaded: true,
      });
    });

    let descriptionHeight = $('textarea#description').prop('scrollHeight');
    this.setState({
      textareaHeight: descriptionHeight
    });

  },
  onSubmit (evt) {
    evt.preventDefault();
    if (!this.state.name.trim()) {
      alertify.error(t('Please enter a title for your project'));
    } else {
      this.props.onSubmit(this);
    }
  },
  render () {
    if (!this.state.sessionLoaded) {
      return (
          <bem.Loading>
            <bem.Loading__inner>
              <i />
              {t('loading...')}
            </bem.Loading__inner>
          </bem.Loading>
        )
    }
    var acct = session.currentAccount;
    var sectors = acct.available_sectors;
    var countries = acct.available_countries;

    if (this.state.permissions && this.state.owner) {
      var perms = this.state.permissions;
      var owner = this.state.owner;

      var sharedWith = [];
      perms.forEach(function(perm) {
        if (perm.user__username != owner && perm.user__username != 'AnonymousUser' && sharedWith.indexOf(perm.user__username) < 0)
          sharedWith.push(perm.user__username);
      });
    }

    return (
      <bem.FormModal__form onSubmit={this.onSubmit}>
        {this.props.context == 'existingForm' && 
          <bem.FormModal__item m={['actions', 'fixed']}>
            <button onClick={this.onSubmit} className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored">
              {this.props.submitButtonValue}
            </button>
          </bem.FormModal__item>
        }
        <bem.FormModal__item m='wrapper'>
          <bem.FormModal__item>
            <label htmlFor="name">
              {t('Project Name')}
            </label>
            <input type="text"
                id="name"
                placeholder={t('Enter title of project here')}
                value={this.state.name}
                onChange={this.nameChange}
              />
          </bem.FormModal__item>
          <bem.FormModal__item>
            <label htmlFor="description">
              {t('Description')}
            </label>
            <textarea type="text"
                id="description"
                placeholder={t('Enter short description here')}
                value={this.state.description}
                onChange={this.descriptionChange}
                rows="1"
                style={{height: this.state.textareaHeight + 'px'}}
              />
          </bem.FormModal__item>
          <bem.FormModal__item>
            <label className="long">
              {t('Please specify the country and the sector where this project will be deployed. ')}
              {t('This information will be used to help you filter results on the project list page.')}
            </label>
          </bem.FormModal__item>

          <bem.FormModal__item m='sector'>
            <label htmlFor="sector">
              {t('Sector')}
            </label>
            <Select
                id="sector"
                value={this.state.sector}
                onChange={this.sectorChange}
                options={sectors}
              />
          </bem.FormModal__item>
          <bem.FormModal__item  m='country'>
            <label htmlFor="country">
              {t('Country')}
            </label>
            <Select
              id="country"
              value={this.state.country}
              onChange={this.countryChange}
              options={countries}
            />
          </bem.FormModal__item>
          <bem.FormModal__item m='metadata-share'>
            <input type="checkbox"
                id="share-metadata"
                checked={this.state['share-metadata']}
                onChange={this.shareMetadataChange}
              />
            <label className="long next-to-checkbox" htmlFor="share-metadata">
              {t('Help KoboToolbox improve this product by sharing the sector and country where this project will be deployed.')}
              &nbsp;
              {t('All the information is submitted anonymously, and will not include the project name or description listed above.')}
            </label>
          </bem.FormModal__item>

          {this.props.context != 'existingForm' &&
            <bem.FormModal__item m='actions'>
              <button onClick={this.onSubmit} className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored">
                {this.props.submitButtonValue}
              </button>
            </bem.FormModal__item>
          }

          {this.props.context == 'existingForm' && this.props.iframeUrl &&
            <bem.FormView__cell m='iframe'>
              <iframe src={this.props.iframeUrl} />
            </bem.FormView__cell>

          }
        </bem.FormModal__item>
      </bem.FormModal__form>
    );
  },
});

export var ProjectSettingsEditor = React.createClass({
  updateAsset (settingsComponent) {
    actions.resources.updateAsset(
      this.props.asset.uid,
      {
        name: settingsComponent.state.name,
        settings: JSON.stringify({
          description: settingsComponent.state.description,
          sector: settingsComponent.state.sector,
          country: settingsComponent.state.country,
          'share-metadata': settingsComponent.state['share-metadata']
        }),
      }
    );
  },
  render () {
    let initialData = {
      name: this.props.asset.name,
      permissions: this.props.asset.permissions,
      owner: this.props.asset.owner__username,
      assetid: this.props.asset.uid
    };
    assign(initialData, this.props.asset.settings);

    return (
      <ProjectSettings
        onSubmit={this.updateAsset}
        submitButtonValue={t('Save Changes')}
        initialData={initialData}
        context='existingForm'
        iframeUrl={this.props.iframeUrl}
      />
    );
  },
});

export var ProjectDownloads = React.createClass({
  getInitialState () {
    return {
      type: 'xls',
      lang: '_default',
      hierInLabels: false,
      groupSep: '/',
    };
  },
  handleChange (e, attr) {
    if (e.target) {
      if (e.target.type == 'checkbox') {
        var val = e.target.checked;
      } else {
        var val = e.target.value;
      }
    } else {
      // react-select just passes a string
      var val = e;
    }
    this.setState({[attr]: val});
  },
  typeChange (e) {this.handleChange(e, 'type');},
  langChange (e) {this.handleChange(e, 'lang');},
  hierInLabelsChange (e) {this.handleChange(e, 'hierInLabels');},
  groupSepChange (e) {this.handleChange(e, 'groupSep');},
  handleSubmit (e) {
    e.preventDefault();

    if (this.state.type.indexOf('_legacy') < 0) {
      let url = this.props.asset.deployment__data_download_links[
        this.state.type
      ];
      if (this.state.type == 'xls' || this.state.type == 'csv') {
        let params = $.param({
          lang: this.state.lang,
          hierarchy_in_labels: this.state.hierInLabels,
          group_sep: this.state.groupSep,
        });
        redirectTo(`${url}?${params}`);
      } else {
        redirectTo(url);
      }
    }
  },
  render () {
    let translations = this.props.asset.content.translations;
    var docTitle = this.props.asset.name || t('Untitled');

    return (
      <DocumentTitle title={`${docTitle} | KoboToolbox`}>
      <bem.FormView__cell>
        <bem.FormModal__form onSubmit={this.handleSubmit}>
          {[
            <bem.FormModal__item key={'t'}>
              <label htmlFor="type">{t('Select export type')}</label>
              <select name="type" value={this.state.type}
                  onChange={this.typeChange}>
                <option value="xls">{t('XLS')}</option>
                <option value="xls_legacy">{t('XLS (legacy)')}</option>
                <option value="csv">{t('CSV')}</option>
                <option value="csv_legacy">{t('CSV (legacy)')}</option>
                <option value="zip_legacy">{t('Media Attachments (ZIP)')}</option>
                <option value="kml_legacy">{t('GPS coordinates (KML)')}</option>
                <option value="analyser_legacy">{t('Excel Analyser')}</option>
                <option value="spss_labels">{t('SPSS Labels')}</option>
              </select>
            </bem.FormModal__item>
          , this.state.type == 'xls' || this.state.type == 'csv' ? [
              <bem.FormModal__item key={'x'}>
                <label htmlFor="lang">{t('Value and header format')}</label>
                <select name="lang" value={this.state.lang}
                    onChange={this.langChange}>
                  <option value="xml">{t('XML values and headers')}</option>
                  <option value="_default">{t('Labels')}</option>
                  {
                    translations && translations.map((t, i) => {
                      if (t) {
                        return <option value={t} key={i}>{t}</option>;
                      }
                    })
                  }
                </select>
              </bem.FormModal__item>,
              <bem.FormModal__item key={'h'}>
                <label htmlFor="hierarchy_in_labels">
                  {t('Include groups in headers')}
                </label>
                <input type="checkbox" name="hierarchy_in_labels"
                  value={this.state.hierInLabels}
                  onChange={this.hierInLabelsChange}
                />
              </bem.FormModal__item>,
              this.state.hierInLabels ?
                <bem.FormModal__item key={'g'}>
                  <label htmlFor="group_sep">{t('Group separator')}</label>
                  <input type="text" name="group_sep"
                    value={this.state.groupSep}
                    onChange={this.groupSepChange}
                  />
                </bem.FormModal__item>
              : null
            ] : null
          , this.state.type.indexOf('_legacy') > 0 ?
            <bem.FormModal__item m='downloads' key={'d'}>
              <iframe src={
                  this.props.asset.deployment__data_download_links[
                    this.state.type]
              }>
              </iframe>
            </bem.FormModal__item>
          :
            <bem.FormModal__item key={'s'}>
              <input type="submit" 
                     value={t('Download')} 
                     className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"/>
            </bem.FormModal__item>
          ]}
        </bem.FormModal__form>
      </bem.FormView__cell>
      </DocumentTitle>
    );
  },
});

export var AddToLibrary = React.createClass({
  mixins: newFormMixins
});

let existingFormMixins = [
    Reflux.ListenerMixin,
    editableFormMixin,
    existingFormMixin,
];

export var FormPage = React.createClass({
  mixins: existingFormMixins
});

export var LibraryPage = React.createClass({
  mixins: existingFormMixins
});
