/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import * as React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import Menu from './Menu';
import NotFound from '../../../app/components/NotFound';
import ScreenPositionHelper from '../../../components/common/ScreenPositionHelper';
import DocMarkdownBlock from '../../../components/docs/DocMarkdownBlock';
import DeferredSpinner from '../../../components/common/DeferredSpinner';
import { translate } from '../../../helpers/l10n';
import { getFrontMatter } from '../../../helpers/markdown';
import { isSonarCloud } from '../../../helpers/system';
import '../styles.css';

interface Props {
  params: { splat?: string };
}

interface State {
  content?: string;
  loading: boolean;
  notFound: boolean;
}

export default class App extends React.PureComponent<Props, State> {
  mounted = false;

  state: State = { loading: false, notFound: false };

  componentDidMount() {
    this.mounted = true;
    this.fetchContent(this.props.params.splat || 'index');

    const footer = document.getElementById('footer');
    if (footer) {
      footer.classList.add('page-footer-with-sidebar', 'documentation-footer');
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const newSplat = nextProps.params.splat || 'index';
    if (newSplat !== this.props.params.splat) {
      this.setState({ content: undefined });
      this.fetchContent(newSplat);
    }
  }

  componentWillUnmount() {
    this.mounted = false;

    const footer = document.getElementById('footer');
    if (footer) {
      footer.classList.remove('page-footer-with-sidebar', 'documentation-footer');
    }
  }

  fetchContent = (path: string) => {
    this.setState({ loading: true });
    import(`Docs/pages/${path === '' ? 'index' : path}.md`).then(
      ({ default: content }) => {
        if (this.mounted) {
          const { scope } = getFrontMatter(content || '');
          if (scope === 'sonarcloud' && !isSonarCloud()) {
            this.setState({ loading: false, notFound: true });
          } else {
            this.setState({ content, loading: false, notFound: false });
          }
        }
      },
      () => {
        if (this.mounted) {
          this.setState({ loading: false, notFound: true });
        }
      }
    );
  };

  renderContent() {
    if (this.state.notFound) {
      return <NotFound withContainer={false} />;
    }

    return (
      <div className="boxed-group">
        <DocMarkdownBlock
          className="documentation-content cut-margins boxed-group-inner"
          content={this.state.content}
          displayH1={true}
        />
      </div>
    );
  }

  render() {
    const pageTitle = getFrontMatter(this.state.content || '').title;
    const mainTitle = translate('documentation.page');
    const isIndex = !this.props.params.splat || this.props.params.splat === '';
    return (
      <div className="layout-page">
        <Helmet title={isIndex || this.state.notFound ? mainTitle : `${pageTitle} - ${mainTitle}`}>
          <meta content="noindex nofollow" name="robots" />
        </Helmet>
        <ScreenPositionHelper className="layout-page-side-outer">
          {({ top }) => (
            <div className="layout-page-side" style={{ top }}>
              <div className="layout-page-side-inner">
                <div className="layout-page-filters">
                  <div className="web-api-page-header">
                    <Link to="/documentation/">
                      <h1>{translate('documentation.page')}</h1>
                    </Link>
                  </div>
                  <Menu splat={this.props.params.splat} />
                </div>
              </div>
            </div>
          )}
        </ScreenPositionHelper>

        <div className="layout-page-main">
          <div className="layout-page-main-inner documentation-layout-inner">
            <DeferredSpinner loading={this.state.loading}>{this.renderContent()}</DeferredSpinner>;
          </div>
        </div>
      </div>
    );
  }
}
