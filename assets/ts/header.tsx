import * as React from 'react';
import { createRoot } from 'react-dom/client';

type NavElement = {
  key: number;
  value: string;
};

const navElements: NavElement[] = [
  { key: 0, value: 'posts' },
  { key: 1, value: 'about' },
  { key: 2, value: '575' },
  { key: 3, value: 'gallery' },
  { key: 4, value: 'comment' },
  { key: 5, value: 'rss' },
];
const ariaControl: string = 'nav-control';

type ButtonProps = {
  open: boolean;
  onClick: React.MouseEventHandler;
};

const Button: React.FC<ButtonProps> = ({ open, onClick }): React.ReactNode => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls={ariaControl}
      aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
    >
      {open ? '✕' : '≡'}
    </button>
  );
};

const NaviBar: React.FC = (): React.ReactNode => {
  const listItems = navElements.map((e) => (
    <li key={e.key}>
      <a href={'/' + (e.value !== 'rss' ? e.value : 'index.xml')}>{e.value}</a>
    </li>
  ));

  return (
    <nav id={ariaControl}>
      <ul>{listItems}</ul>
    </nav>
  );
};

const windowWidth = (): number => {
  return window.innerWidth;
};

const subscribeWindowWidthChange = (callback: () => void): (() => void) => {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
};

const title: string = '花園シャトー107号室';

const Header: React.FC = (): React.ReactNode => {
  const [open, setOpen] = React.useState(false);
  const width = React.useSyncExternalStore(
    subscribeWindowWidthChange,
    windowWidth,
  );

  const toggle = () => {
    setOpen((prev) => !prev);
  };

  const isMobile = (width: number): boolean => {
    return width < 600;
  };

  return (
    <header>
      <div className="header-top">
        <h1>
          <a href="/">{title}</a>
        </h1>
        {isMobile(width) ? <Button open={open} onClick={toggle} /> : <></>}
      </div>
      <NaviBar />
    </header>
  );
};

const domNode = document.getElementById('header');
if (domNode !== null) {
  const root = createRoot(domNode);
  root.render(<Header />);
}
