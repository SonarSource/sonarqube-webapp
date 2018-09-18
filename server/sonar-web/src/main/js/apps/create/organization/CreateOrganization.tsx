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
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { Link, withRouter, WithRouterProps } from 'react-router';
import { connect } from 'react-redux';
import OrganizationDetailsStep from './OrganizationDetailsStep';
import PlanStep from './PlanStep';
import { formatPrice } from './utils';
import { whenLoggedIn } from './whenLoggedIn';
import { createOrganization } from '../../organizations/actions';
import { getSubscriptionPlans } from '../../../api/billing';
import { OrganizationBase, Organization, SubscriptionPlan } from '../../../app/types';
import { translate } from '../../../helpers/l10n';
import { getOrganizationUrl } from '../../../helpers/urls';
import '../../../app/styles/sonarcloud.css';
import '../../tutorials/styles.css'; // TODO remove me

interface Props {
  createOrganization: (organization: OrganizationBase) => Promise<Organization>;
}

enum Step {
  OrganizationDetails,
  Plan
}

interface State {
  loading: boolean;
  organization?: Organization;
  step: Step;
  subscriptionPlans?: SubscriptionPlan[];
}

export class CreateOrganization extends React.PureComponent<Props & WithRouterProps, State> {
  mounted = false;
  state: State = {
    loading: true,
    step: Step.OrganizationDetails
  };

  componentDidMount() {
    this.mounted = true;
    document.body.classList.add('white-page');
    document.documentElement.classList.add('white-page');
    this.fetchSubscriptionPlans();
  }

  componentWillUnmount() {
    this.mounted = false;
    document.body.classList.remove('white-page');
  }

  fetchSubscriptionPlans = () => {
    getSubscriptionPlans().then(
      subscriptionPlans => {
        if (this.mounted) {
          this.setState({ loading: false, subscriptionPlans });
        }
      },
      () => {
        if (this.mounted) {
          this.setState({ loading: false });
        }
      }
    );
  };

  handleOrganizationDetailsStepOpen = () => {
    this.setState({ step: Step.OrganizationDetails });
  };

  handleOrganizationDetailsFinish = (organization: Required<OrganizationBase>) => {
    this.setState({ organization, step: Step.Plan });
    return Promise.resolve();
  };

  handlePaidPlanChoose = () => {
    if (this.state.organization) {
      this.props.router.push(getOrganizationUrl(this.state.organization.key));
    }
  };

  handleFreePlanChoose = () => {
    this.createOrganization().then(
      key => this.props.router.push(getOrganizationUrl(key)),
      () => {}
    );
  };

  createOrganization = () => {
    const { organization } = this.state;
    if (organization) {
      return this.props
        .createOrganization({
          avatar: organization.avatar,
          description: organization.description,
          key: organization.key,
          name: organization.name || organization.key,
          url: organization.url
        })
        .then(({ key }) => key);
    } else {
      return Promise.reject();
    }
  };

  render() {
    const { location } = this.props;
    const { loading, subscriptionPlans } = this.state;
    const header = translate('onboarding.create_organization.page.header');
    const startedPrice = subscriptionPlans && subscriptionPlans[0] && subscriptionPlans[0].price;
    const formattedPrice = formatPrice(startedPrice);

    return (
      <>
        <Helmet title={header} titleTemplate="%s" />
        <div className="sonarcloud page page-limited">
          <header className="page-header">
            <h1 className="page-title big-spacer-bottom">{header}</h1>
            {startedPrice !== undefined && (
              <p className="page-description">
                <FormattedMessage
                  defaultMessage={translate('onboarding.create_organization.page.description')}
                  id="onboarding.create_organization.page.description"
                  values={{
                    break: <br />,
                    price: formattedPrice,
                    more: (
                      <Link target="_blank" to="/documentation/sonarcloud-pricing">
                        {translate('learn_more')}
                      </Link>
                    )
                  }}
                />
              </p>
            )}
          </header>

          {loading ? (
            <i className="spinner" />
          ) : (
            <>
              <OrganizationDetailsStep
                finished={this.state.organization !== undefined}
                onContinue={this.handleOrganizationDetailsFinish}
                onOpen={this.handleOrganizationDetailsStepOpen}
                open={this.state.step === Step.OrganizationDetails}
                organization={this.state.organization}
              />

              {subscriptionPlans !== undefined &&
                this.state.organization && (
                  <PlanStep
                    createOrganization={this.createOrganization}
                    onFreePlanChoose={this.handleFreePlanChoose}
                    onPaidPlanChoose={this.handlePaidPlanChoose}
                    onlyPaid={location.state && location.state.paid === true}
                    open={this.state.step === Step.Plan}
                    startingPrice={formattedPrice}
                    subscriptionPlans={subscriptionPlans}
                  />
                )}
            </>
          )}
        </div>
      </>
    );
  }
}

const mapDispatchToProps = { createOrganization: createOrganization as any };

export default whenLoggedIn(
  connect(
    null,
    mapDispatchToProps
  )(withRouter(CreateOrganization))
);
