import React from 'react';
import config from 'config';
import cx from 'classnames';
import { toast } from 'react-hot-toast';
import { pluginsService } from '@/_services';
import { capitalizeFirstLetter, useTagsByPluginId } from './utils';
import Icon from '@/_ui/Icon/SolidIcons';

export const MarketplaceCard = ({ id, name, repo, description, version, isInstalled = false }) => {
  const [installed, setInstalled] = React.useState(isInstalled);
  const [installing, setInstalling] = React.useState(false);

  const { tags } = useTagsByPluginId(id);

  React.useEffect(() => {
    setInstalled(isInstalled);
  }, [isInstalled]);

  const installPlugin = async () => {
    const body = {
      id,
      name,
      repo,
      description,
      version,
    };

    setInstalling(true);
    const { error } = await pluginsService.installPlugin(body);
    setInstalling(false);

    if (error) {
      toast.error(error?.message || `Unable to install ${name}`);
      return;
    }
    toast.success(`${capitalizeFirstLetter(name)} installed`);
    setInstalled(true);
  };

  let iconSrc;

  if (repo) {
    iconSrc = `https://raw.githubusercontent.com/${repo}/main/lib/icon.svg`;
  } else {
    iconSrc = `${config.TOOLJET_MARKETPLACE_URL}/marketplace-assets/${id}/lib/icon.svg`;
  }

  return (
    <div className="col-sm-6 col-lg-4">
      <div className="plugins-card card-borderless">
        <div className="card-body card-body-alignment">
          <div className="row align-items-center">
            <div className="col-auto">
              <span className="text-white app-icon-main">
                <img height="40" width="40" src={iconSrc} />
              </span>
            </div>
            <div className="col">
              <div className="tw-flex tw-items-center tw-gap-[6px]">
                <div className="font-weight-medium text-capitalize">{name}</div>
                {tags.map((tag) => {
                  if (tag === 'AI') {
                    return (
                      <div key={tag} className="tag-container">
                        <Icon name="AI-tag" />
                        <span>{tag}</span>
                      </div>
                    );
                  }
                })}
              </div>
              <div>{description}</div>
            </div>
          </div>
          <div>
            <div className="row">
              <div className="col">
                <sub>v{version}</sub>
              </div>
              <div className={cx('col-auto', { disabled: installing || installed })} onClick={installPlugin}>
                <div className="marketplace-install cursor-pointer">Install{installed && 'ed'}</div>
              </div>
            </div>
          </div>
        </div>
        {installing && (
          <div className="progress progress-sm">
            <div className="progress-bar progress-bar-indeterminate"></div>
          </div>
        )}
      </div>
    </div>
  );
};
