/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import {
  Button,
  Heading,
  IconCheck,
  IconError,
  Modal,
  ModalSize,
  Spinner,
  Text,
} from '@sonarsource/echoes-react';
import { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useGetScaSelfTestQuery } from '~sq-server-commons/queries/sca';

function ScaConnectivityTest() {
  const {
    data: scaSelfTestResults,
    isFetching: isLoading,
    isError,
    refetch,
  } = useGetScaSelfTestQuery();

  const recheckConnectivity = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    refetch();
  };

  const [showDetails, setShowDetails] = useState(false);
  const handleShowDetails = useCallback(() => {
    setShowDetails(true);
  }, []);
  const handleCloseDetails = useCallback(() => {
    setShowDetails(false);
  }, []);

  return (
    <div>
      <Heading as="h3" hasMarginBottom>
        <FormattedMessage id="property.sca.admin.selftest.title" />
      </Heading>
      <Text as="p" className="sw-mb-6">
        <FormattedMessage id="property.sca.admin.selftest.description" />
      </Text>
      <Spinner
        ariaLabel="Checking connectivity"
        isLoading={isLoading}
        label={<FormattedMessage id="property.sca.admin.selftest.checking" />}
      >
        <Text className="sw-mt-4 sw-mr-4">
          <>
            {!isError && scaSelfTestResults?.selfTestPassed ? (
              <>
                <IconCheck className="sw-mr-1" color="echoes-color-icon-success" />
                <FormattedMessage id="property.sca.admin.selftest.success" />
              </>
            ) : (
              <>
                <IconError className="sw-mr-1" color="echoes-color-icon-danger" />
                <FormattedMessage id="property.sca.admin.selftest.failure" />
              </>
            )}
          </>
          <div className="sw-mt-4">
            <Button className="sw-mr-4" onClick={handleShowDetails}>
              <FormattedMessage id="property.sca.admin.selftest.show_details" />
            </Button>{' '}
            <Button onClick={recheckConnectivity}>
              <FormattedMessage id="property.sca.admin.selftest.recheck" />
            </Button>
          </div>
        </Text>
      </Spinner>
      <div className="sw-flex">
        <Modal
          content={
            <>
              <span>
                <FormattedMessage id="property.sca.admin.selftest.details.description" />
              </span>
              <pre>
                {scaSelfTestResults ? (
                  JSON.stringify(scaSelfTestResults, null, 2)
                ) : (
                  <FormattedMessage id="no_results" />
                )}
              </pre>
            </>
          }
          isOpen={showDetails}
          onOpenChange={handleCloseDetails}
          primaryButton={
            <Button onClick={handleCloseDetails}>{<FormattedMessage id="close" />}</Button>
          }
          size={ModalSize.Wide}
          title={<FormattedMessage id="property.sca.admin.selftest.details.title" />}
        />
      </div>
    </div>
  );
}

export default ScaConnectivityTest;
