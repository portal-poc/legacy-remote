import { version } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router';
import type { PlatformContract } from '@portal-poc/platform-contract';

type RemoteRootProps = { platform: PlatformContract; basename?: string };

const box = { fontFamily: 'system-ui, sans-serif', padding: 16, border: '2px dashed #c77', borderRadius: 8 } as const;

const Home = ({ platform }: RemoteRootProps) => {
  const goHome = () => {
    platform.bridge?.navigateToHost('/');
  };
  return (
    <>
      <p>
        Legacy app on <b>React {version}</b>, mounted through MF Bridge in its own root.
      </p>
      <p>Signed in as: {platform.auth.getAccount()?.displayName ?? '—'}</p>
      <p>
        <Link to="about">About (remote-internal route)</Link>
      </p>
      <button type="button" onClick={goHome}>
        Back to host home (platform.bridge.navigateToHost)
      </button>
    </>
  );
};

const About = () => (
  <p>
    Limits of the isolated mode: no shared transitions/Suspense/context with the host; its own fallback; host view
    transitions animate only the container. <Link to="/">Back</Link>
  </p>
);

/** Same entry signature as every remote; the router is its own (React Router 7 on React 18). */
export const RemoteRoot = ({ platform, basename }: RemoteRootProps) => (
  <div style={box}>
    <h2>Legacy</h2>
    <BrowserRouter basename={platform.bridge?.basename ?? basename ?? '/'}>
      <Routes>
        <Route index element={<Home platform={platform} />} />
        <Route path="about" element={<About />} />
      </Routes>
    </BrowserRouter>
  </div>
);

export default RemoteRoot;
