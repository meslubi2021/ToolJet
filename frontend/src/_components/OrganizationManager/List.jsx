import React, { useEffect, useState } from 'react';
import { authenticationService } from '@/_services';
import { CustomSelect } from './CustomSelect';
import { getAvatar, decodeEntities } from '@/_helpers/utils';
import { appendWorkspaceId, getWorkspaceIdOrSlugFromURL } from '@/_helpers/routes';
import { ToolTip } from '@/_components';
import { useCurrentSessionStore } from '@/_stores/currentSessionStore';
import { shallow } from 'zustand/shallow';
import SolidIcon from '@/_ui/Icon/SolidIcons';
import { EditOrganization } from './EditOrganization';

/* TODO: 
  each workspace related component has organizations list component which can be moved to a single wrapper. 
  otherwise this component will intiate everytime we switch between pages
*/
export const OrganizationList = function () {
  const { current_organization_id } = authenticationService.currentSessionValue;
  const { fetchOrganizations, organizationList, isGettingOrganizations } = useCurrentSessionStore(
    (state) => ({
      organizationList: state.organizations,
      isGettingOrganizations: state.isGettingOrganizations,
      fetchOrganizations: state.actions.fetchOrganizations,
    }),
    shallow
  );
  const darkMode = localStorage.getItem('darkMode') === 'true';

  useEffect(() => {
    fetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchOrganization = (id) => {
    const organization = organizationList.find((org) => org.id === id);
    if (![id, organization.slug].includes(getWorkspaceIdOrSlugFromURL())) {
      const newPath = appendWorkspaceId(organization.slug || id, location.pathname, true);
      window.history.replaceState(null, null, newPath);
      window.location.reload();
    }
  };

  const options = organizationList
    .map((org) => ({
      value: org.id,
      name: org.name,
      slug: org.slug,
      label: (
        <div className={`align-items-center d-flex tj-org-dropdown  ${darkMode && 'dark-theme'}`}>
          {org.id === current_organization_id ? (
            <div className="current-org-avatar">
              <SolidIcon name="tick" fill="#3E63DD" dataCy="add-new-workspace-link" width="21" />
            </div>
          ) : (
            <div
              className="dashboard-org-avatar "
              data-cy={`${String(org.name).toLowerCase().replace(/\s+/g, '-')}-avatar`}
            >
              {getAvatar(org.name)}
            </div>
          )}

          <ToolTip message={org.name} placement="right">
            <div className="org-name" data-cy={`${String(org.name).toLowerCase().replace(/\s+/g, '-')}-name-selector`}>
              <span style={{ color: org.id === current_organization_id ? '#3E63DD' : 'var(--slate12)' }}>
                {decodeEntities(org.name)}
              </span>
            </div>
          </ToolTip>
          {org.id === current_organization_id ? (
            <div className="current-org-indicator" data-cy="current-org-indicator" onClick={() => setShowEditOrg(true)}>
              <SolidIcon name="editable" fill="#3E63DD" dataCy="add-new-workspace-link" width="14" />
            </div>
          ) : (
            <div
              className="current-org-indicator"
              data-cy="current-org-indicator"
              onClick={() => console.log('Dummy onClick')}
            >
              <SolidIcon name="arrowtransfer" fill="#3E63DD" width="14" className="add-new-workspace-icon" />
            </div>
          )}
        </div>
      ),
    }))
    .sort((a, b) => (a.value === current_organization_id ? -1 : b.value === current_organization_id ? 1 : 0));

  const [showEditOrg, setShowEditOrg] = useState(false);
  const currentValue = organizationList.find((option) => option?.id === current_organization_id);

  return (
    <div className="org-select-container">
      <EditOrganization showEditOrg={showEditOrg} setShowEditOrg={setShowEditOrg} currentValue={currentValue} />
      <CustomSelect
        isLoading={isGettingOrganizations}
        options={options}
        value={current_organization_id}
        onChange={(id) => switchOrganization(id)}
        className={`tj-org-select  ${darkMode && 'dark-theme'}`}
      />
    </div>
  );
};
