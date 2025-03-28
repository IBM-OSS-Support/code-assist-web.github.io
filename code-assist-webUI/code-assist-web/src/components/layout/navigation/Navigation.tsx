import React, { useState, createContext, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Header, HeaderGlobalAction, HeaderGlobalBar, HeaderMenuButton, HeaderName, SideNav, SideNavItems, SideNavLink, Theme } from '@carbon/react';
import {Home, UserAvatar, Folders, Group, GroupResource} from '@carbon/react/icons';
import { ActiveTabProvider } from './use-active-tab/UseActiveTab';
import "./_Navigation.scss";

// Create a context for sharing the active tab
// export const ActiveTabContext = createContext<string>('');

const Navigation: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('Dashboard');

  const handleNavLinkClick = (tab: string) => {
    setActiveTab(tab);
    console.log("handleNavLinkClick tab", tab);
  };


  React.useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/dashboard') {
      setActiveTab('Dashboard');
    } else if (location.pathname === '/summary') {
      setActiveTab('Summary');
    } else if (location.pathname === '/leaderboard') {
      setActiveTab('Leaderboard');
    } else if (location.pathname === '/model-comparison') {
      setActiveTab('EvaluationComparison');
    }
  }, [location]);

  console.log("Nav activeTab:", activeTab);
  
  return (
    <>
    <ActiveTabProvider value={activeTab}>
      <Theme theme="g90">
        <Header
          aria-label="IBM Code-assist"
          className={`navigation-menu`}
        >
          
          <HeaderMenuButton
            aria-label={'Global navigation'}
            id="header-menu-button"
          />
          <HeaderName
            prefix=""
          >
            {/* Code-assist */}
            <img alt="IBM code-assist Logo" src="/ibm-code-assist-logo.svg" width={175} height={47} title="IBM code-assist" />
          </HeaderName>
          <SideNav
            id="side-nav"
            aria-label={'Side navigation'}
            isRail
          >
            <SideNavItems>
              <SideNavLink renderIcon={Home} href="/dashboard" onClick={() => handleNavLinkClick('Dashboard')}>
                Dashboard
              </SideNavLink>
              <SideNavLink renderIcon={Folders} href="/summary" onClick={() => handleNavLinkClick('Summary')}>
                Summary
              </SideNavLink>
              <SideNavLink renderIcon={Group} href="/leaderboard" onClick={() => handleNavLinkClick('Leaderboard')}>
                BigCodeBench Leaderboard
              </SideNavLink>
              <SideNavLink renderIcon={GroupResource} href="/model-comparison" onClick={() => handleNavLinkClick('EvaluationComparison')}>
                Model Comparison
              </SideNavLink>
            </SideNavItems>
          </SideNav>
          <HeaderGlobalBar>
            <HeaderGlobalAction
              className={`profile-trigger-button`}
              aria-label={'Profile'}
            >
              <UserAvatar size={25} />
            {/* <HeaderMenu aria-label="User" menuLinkName="User">
              <HeaderMenuItem href="#">Profile</HeaderMenuItem>
              <HeaderMenuItem isActive href="#">
                Settings
              </HeaderMenuItem>
              <HeaderMenuItem href="#">LogOut</HeaderMenuItem>
            </HeaderMenu> */}
            </HeaderGlobalAction>
          </HeaderGlobalBar>
        </Header>
      </Theme>
      {children}
    </ActiveTabProvider>
    </>
  );
}

export default Navigation;