import Link from 'next/link';
import styles from './header.module.scss'

export default function Header() {
  return (
    <header className={styles.header}>
      <div>
        <Link href={'/'}>
          <a>
            <img src='/assets/logo.svg' alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
}