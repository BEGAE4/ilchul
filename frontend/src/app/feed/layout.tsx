import styles from './layout.module.scss';

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.feedLayout}>{children}</div>;
}
