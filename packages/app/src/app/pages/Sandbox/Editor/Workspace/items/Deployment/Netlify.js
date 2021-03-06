import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import LinkIcon from 'react-icons/lib/fa/external-link';
import Cogs from 'react-icons/lib/fa/cogs';
import LightningIcon from 'react-icons/lib/md/flash-on';
import NetlifyLogo from 'app/components/NetlifyLogo';
import DeploymentIntegration from 'app/components/DeploymentIntegration';
import getTemplate from '@codesandbox/common/lib/templates';
import { Button } from '@codesandbox/common/lib/components/Button';
import { resolveDirectory } from '@codesandbox/common/lib/sandbox/modules';
import getNetlifyConfig from 'app/utils/getNetlifyConfig';
import { WorkspaceInputContainer, WorkspaceSubtitle } from '../../elements';
import {
  Deploys,
  Deploy,
  Name,
  Link,
  DeploysWrapper,
  Wrapper,
  ButtonContainer,
} from './Elements';

const getFunctionDir = sandbox => {
  try {
    return resolveDirectory(
      getNetlifyConfig(sandbox).functions,
      sandbox.modules,
      sandbox.directories
    );
  } catch (e) {
    return [];
  }
};

class NetlifyDeployment extends Component {
  state = { show: false };

  toggleNetlify = () =>
    this.setState(state => ({
      show: !state.show,
    }));

  componentDidMount() {
    this.props.signals.deployment.getNetlifyDeploys();
  }

  render() {
    const {
      store: { deployment, editor },
      signals,
    } = this.props;

    const template = getTemplate(editor.currentSandbox.template);
    const { show } = this.state;
    const functionDirectory = getFunctionDir(editor.currentSandbox);

    const functions = editor.currentSandbox.modules.filter(
      m => m.directoryShortid === functionDirectory.shortid
    );
    return (
      template.netlify !== false && (
        <Wrapper loading={deployment.deploying}>
          <WorkspaceInputContainer
            style={{ marginTop: '1rem', marginBottom: 0 }}
          >
            <DeploymentIntegration
              loading={deployment.deploying || deployment.building}
              open={show}
              toggle={() => this.toggleNetlify()}
              color="#fff"
              light
              Icon={NetlifyLogo}
              name="netlify"
              beta
              deploy={() => signals.deployment.deployWithNetlify()}
            >
              Deploy your sandbox site on{' '}
              <a
                href="https://netlify.com"
                target="_blank"
                rel="noreferrer noopener"
              >
                <span>Netlify</span>
              </a>
            </DeploymentIntegration>
          </WorkspaceInputContainer>
          {deployment.netlifySite && show ? (
            <DeploysWrapper
              css={`
                background: #fff;
                margin-top: -4px;
              `}
            >
              <WorkspaceSubtitle>Sandbox Site</WorkspaceSubtitle>
              <WorkspaceInputContainer>
                <Deploys>
                  <Deploy key={deployment.netlifySite.uid}>
                    <Name light>{deployment.netlifySite.name}</Name>
                    {!deployment.building && <div>Building</div>}
                    {functions.length ? (
                      <>
                        <WorkspaceSubtitle
                          css={`
                            padding-left: 0;
                          `}
                        >
                          Functions
                        </WorkspaceSubtitle>
                        <section
                          css={`
                            display: flex;
                            margin-bottom: 0.5rem;
                          `}
                        >
                          {functions.map(file => (
                            <Link
                              disabled={deployment.building}
                              href={`${
                                deployment.netlifySite.url
                              }/.netlify/functions/${
                                file.title.split('.js')[0]
                              }`}
                              css={`
                                margin-top: 0;
                                margin-right: 0.5rem;
                              `}
                              target="_blank"
                              rel="noreferrer noopener"
                            >
                              <LightningIcon />
                              <span>{file.title.split('.js')[0]}</span>
                            </Link>
                          ))}
                        </section>
                      </>
                    ) : null}

                    <WorkspaceSubtitle
                      css={`
                        padding-left: 0;
                      `}
                    >
                      Actions
                    </WorkspaceSubtitle>
                    <ButtonContainer>
                      <Link
                        disabled={deployment.building}
                        href={deployment.netlifySite.url}
                        target="_blank"
                        css={`
                          margin-top: 0;
                        `}
                        rel="noreferrer noopener"
                      >
                        {deployment.building ? (
                          <>
                            <Cogs /> Building...
                          </>
                        ) : (
                          <>
                            <LinkIcon /> Visit
                          </>
                        )}
                      </Link>

                      {deployment.netlifyClaimUrl ? (
                        <Link
                          disabled={deployment.building}
                          href={deployment.netlifyClaimUrl}
                          target="_blank"
                          css={`
                            margin-top: 0;
                          `}
                          rel="noreferrer noopener"
                        >
                          <span>Claim Site</span>
                        </Link>
                      ) : null}
                    </ButtonContainer>
                    {deployment.netlifyLogs ? (
                      <Button
                        css={`
                          margin-top: 20px;
                        `}
                        small
                        onClick={() =>
                          signals.modalOpened({
                            modal: 'netlifyLogs',
                          })
                        }
                      >
                        <span>View Logs</span>
                      </Button>
                    ) : null}
                  </Deploy>
                </Deploys>
              </WorkspaceInputContainer>
            </DeploysWrapper>
          ) : null}
        </Wrapper>
      )
    );
  }
}
export default inject('signals', 'store')(observer(NetlifyDeployment));
