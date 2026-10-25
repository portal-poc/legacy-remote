import { useEffect, useState, version } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router';
import type { PlatformContract } from '@portal-poc/platform-contract';

type RemoteRootProps = { platform: PlatformContract; basename?: string };

const box = { fontFamily: 'system-ui, sans-serif', padding: 16, border: '2px dashed #c77', borderRadius: 8 } as const;

/** Page title through the contract (no platform-runtime on React 18): the host composes "<title> · Legacy · Portal". */
const usePageTitle = (platform: PlatformContract, title: string) => {
  useEffect(() => {
    platform.document?.setTitle(title);
    return () => platform.document?.setTitle(null);
  }, [platform, title]);
};

/**
 * Our router is a BrowserRouter (no data router → no useBlocker): its links ask the platform's guards themselves.
 * Host menu clicks and navigateToHost are guarded by the host's blocker; both use the same registry and dialog.
 */
const GuardedLink = ({ platform, basename, to, children }: { platform: PlatformContract; basename: string; to: string; children: ReactNode }) => {
  const navigate = useNavigate();
  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    const pathname = `${basename.replace(/\/$/, '')}/${to}`.replace(/\/$/, '') || '/';
    const nav = platform.navigation;
    if (!nav?.isBlocked(pathname)) {
      void navigate(to);
      return;
    }
    void nav.confirmLeave(pathname).then((leave) => leave && navigate(to));
  };
  return (
    <a href={to} onClick={handleClick}>
      {children}
    </a>
  );
};

const Home = ({ platform, basename }: { platform: PlatformContract; basename: string }) => {
  usePageTitle(platform, 'Overview');
  const [dirty, setDirty] = useState(false);
  // A leave guard straight from the contract: while registered, the host asks before any navigation leaves.
  useEffect(() => (dirty ? platform.navigation?.guard({ message: 'Legacy has unsaved changes.' }) : undefined), [platform, dirty]);

  const goHome = () => {
    platform.bridge?.navigateToHost('/');
  };
  return (
    <>
      <p>
        Legacy app on <b>React {version}</b>, mounted through MF Bridge in its own root.
      </p>
      <p>Signed in as: {platform.auth.getAccount()?.displayName ?? '—'}</p>
      <label>
        <input type="checkbox" checked={dirty} onChange={(event) => setDirty(event.target.checked)} /> I have unsaved
        changes (leaving asks: host menu, the links below, back, reload)
      </label>
      <p>
        <GuardedLink platform={platform} basename={basename} to="about">
          About (remote-internal route)
        </GuardedLink>
      </p>
      <button type="button" onClick={goHome}>
        Back to host home (platform.bridge.navigateToHost)
      </button>
    </>
  );
};

const About = ({ platform, basename }: { platform: PlatformContract; basename: string }) => {
  usePageTitle(platform, 'About');
  return (
    <p>
      Limits of the isolated mode: no shared transitions/Suspense/context with the host; its own fallback; host view
      transitions animate only the container.{' '}
      <GuardedLink platform={platform} basename={basename} to="">
        Back
      </GuardedLink>
    </p>
  );
};

/** Same entry signature as every remote; the router is its own (React Router 7 on React 18). */
export const RemoteRoot = ({ platform, basename }: RemoteRootProps) => {
  const routerBasename = platform.bridge?.basename ?? basename ?? '/';
  return (
    <div style={box}>
      <h2>Legacy</h2>
      <BrowserRouter basename={routerBasename}>
        <Routes>
          <Route index element={<Home platform={platform} basename={routerBasename} />} />
          <Route path="about" element={<About platform={platform} basename={routerBasename} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default RemoteRoot;
