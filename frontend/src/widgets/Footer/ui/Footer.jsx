import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.socialLinks}>
            <div className={styles.socialIconsWrapper}>
              <a target="_blank" className={styles.socialIcon} href="https://t.me/risazatvorchestvo" rel="noreferrer">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z"></path>
                </svg>
              </a>
              <a target="_blank" className={styles.socialIcon} href="https://www.twitch.tv/risazatvorchestvo" rel="noreferrer">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M391.17,103.47H352.54v109.7h38.63ZM285,103H246.37V212.75H285ZM120.83,0,24.31,91.42V420.58H140.14V512l96.53-91.42h77.25L487.69,256V0ZM449.07,237.75l-77.22,73.12H294.61l-67.6,64v-64H140.14V36.58H449.07Z"></path>
                </svg>
              </a>
              <a target="_blank" className={styles.socialIcon} href="https://vk.com/risazatvorchestvo" rel="noreferrer">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M545 117.7c3.7-12.5 0-21.7-17.8-21.7h-58.9c-15 0-21.9 7.9-25.6 16.7 0 0-30 73.1-72.4 120.5-13.7 13.7-20 18.1-27.5 18.1-3.7 0-9.4-4.4-9.4-16.9V117.7c0-15-4.2-21.7-16.6-21.7h-92.6c-9.4 0-15 7-15 13.5 0 14.2 21.2 17.5 23.4 57.5v86.8c0 19-3.4 22.5-10.9 22.5-20 0-68.6-73.4-97.4-157.4-5.8-16.3-11.5-22.9-26.6-22.9H38.8c-16.8 0-20.2 7.9-20.2 16.7 0 15.6 20 93.1 93.1 195.5C160.4 378.1 229 416 291.4 416c37.5 0 42.1-8.4 42.1-22.9 0-66.8-3.4-73.1 15.4-73.1 8.7 0 23.7 4.4 58.7 38.1 40 40 46.6 57.9 69 57.9h58.9c16.8 0 25.3-8.4 20.4-25-11.2-34.9-86.9-106.7-90.3-111.5-8.7-11.2-6.2-16.2 0-26.2.1-.1 72-101.3 79.4-135.6z"></path>
                </svg>
              </a>
              <a target="_blank" className={styles.socialIcon} href="/playlists" rel="noreferrer">
                <img 
                  alt="Плейлисты РЗТ" 
                  width="21" 
                  height="21" 
                  decoding="async" 
                  data-nimg="1" 
                  style={{ color: 'transparent' }} 
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yLjYyNSA3QzIuNjI1IDYuNTE2NzYgMy4wMTY3NSA2LjEyNSAzLjUgNi4xMjVIMjQuNUMyNC45ODMyIDYuMTI1IDI1LjM3NSA2LjUxNjc2IDI1LjM3NSA3QzI1LjM3NSA3LjQ4MzI1IDI0Ljk4MzIgNy44NzUgMjQuNSA3Ljg3NUgzLjVDMy4wMTY3NSA3Ljg3NSAyLjYyNSA3LjQ4MzI1IDIuNjI1IDdaTTIuNjI1IDExLjY2NjdDMi42MjUgMTEuMTgzNCAzLjAxNjc1IDEwLjc5MTcgMy41IDEwLjc5MTdIMjQuNUMyNC45ODMyIDEwLjc5MTcgMjUuMzc1IDExLjE4MzQgMjUuMzc1IDExLjY2NjdDMjUuMzc1IDEyLjE0OTkgMjQuOTgzMiAxMi41NDE3IDI0LjUgMTIuNTQxN0gzLjVDMy4wMTY3NSAxMi41NDE3IDIuNjI1IDEyLjE0OTkgMi42MjUgMTEuNjY2N1pNMjIuNDA2MiAxNS42ODM2TDIyLjUxMDYgMTUuNzQzOUMyMy40MzA5IDE2LjI3NTEgMjQuMTkzNiAxNi43MTU1IDI0LjczNzYgMTcuMTI3OEMyNS4yOTE5IDE3LjU0NzggMjUuNzg5MiAxOC4wNjA5IDI1LjkxODQgMTguNzk0MkMyNS45NzE2IDE5LjA5NTggMjUuOTcxNiAxOS40MDQyIDI1LjkxODQgMTkuNzA1OEMyNS43ODkyIDIwLjQzOTEgMjUuMjkxOSAyMC45NTIyIDI0LjczNzYgMjEuMzcyMkMyNC4xOTM2IDIxLjc4NDUgMjMuNDMwOSAyMi4yMjQ5IDIyLjUxMDUgMjIuNzU2MkwyMi40MDYyIDIyLjgxNjRDMjEuNDg1OSAyMy4zNDc4IDIwLjcyMyAyMy43ODgyIDIwLjA5NDEgMjQuMDUzMkMxOS40NTMxIDI0LjMyMzMgMTguNzYwMiAyNC40OTczIDE4LjA2MDYgMjQuMjQyNkMxNy43NzI4IDI0LjEzNzkgMTcuNTA1NiAyMy45ODM2IDE3LjI3MSAyMy43ODY4QzE2LjcwMDYgMjMuMzA4MSAxNi41MDQ5IDIyLjYyMSAxNi40MTgzIDIxLjkzMUMxNi4zMzMzIDIxLjI1MzggMTYuMzMzMyAyMC4zNzI5IDE2LjMzMzMgMTkuMzEwM1YxOS4xODk3QzE2LjMzMzMgMTguMTI3MSAxNi4zMzMzIDE3LjI0NjMgMTYuNDE4MyAxNi41NjlDMTYuNTA0OSAxNS44NzkgMTYuNzAwNiAxNS4xOTE5IDE3LjI3MSAxNC43MTMyQzE3LjUwNTYgMTQuNTE2NCAxNy43NzI4IDE0LjM2MjEgMTguMDYwNiAxNC4yNTc0QzE4Ljc2MDIgMTQuMDAyNyAxOS40NTMxIDE0LjE3NjggMjAuMDk0MSAxNC40NDY4QzIwLjcyMyAxNC43MTE4IDIxLjQ4NTkgMTUuMTUyMiAyMi40MDYyIDE1LjY4MzZaTTE5LjQxNDYgMTYuMDU5NUMxOC44OTkxIDE1Ljg0MjMgMTguNzI2MiAxNS44Nzc0IDE4LjY1OTEgMTUuOTAxOUMxOC41NjMyIDE1LjkzNjggMTguNDc0MSAxNS45ODgyIDE4LjM5NTkgMTYuMDUzOEMxOC4zNDEyIDE2LjA5OTggMTguMjI0NCAxNi4yMzE4IDE4LjE1NDYgMTYuNzg2OUMxOC4wODUgMTcuMzQyIDE4LjA4MzMgMTguMTExNyAxOC4wODMzIDE5LjI1QzE4LjA4MzMgMjAuMzg4MyAxOC4wODUgMjEuMTU4IDE4LjE1NDYgMjEuNzEzMUMxOC4yMjQ0IDIyLjI2ODIgMTguMzQxMiAyMi40MDAyIDE4LjM5NTkgMjIuNDQ2MkMxOC40NzQxIDIyLjUxMTggMTguNTYzMiAyMi41NjMyIDE4LjY1OTEgMjIuNTk4MUMxOC43MjYyIDIyLjYyMjYgMTguODk5MSAyMi42NTc3IDE5LjQxNDYgMjIuNDQwNUMxOS45MzAyIDIyLjIyMzMgMjAuNTk3NSAyMS44Mzk5IDIxLjU4MzMgMjEuMjcwOEMyMi41NjkyIDIwLjcwMTYgMjMuMjM0OSAyMC4zMTUzIDIzLjY4MDggMTkuOTc3NEMyNC4xMjY3IDE5LjYzOTYgMjQuMTgyNyAxOS40NzIzIDI0LjE5NSAxOS40MDE5QzI0LjIxMjggMTkuMzAxNSAyNC4yMTI4IDE5LjE5ODYgMjQuMTk1IDE5LjA5ODFDMjQuMTgyNyAxOS4wMjc4IDI0LjEyNjcgMTguODYwNSAyMy42ODA4IDE4LjUyMjZDMjMuMjM0OSAxOC4xODQ3IDIyLjU2OTIgMTcuNzk4NCAyMS41ODMzIDE3LjIyOTJDMjAuNTk3NSAxNi42NjAxIDE5LjkzMDIgMTYuMjc2OCAxOS40MTQ2IDE2LjA1OTVaTTIuNjI1IDE2LjMzMzNDMi42MjUgMTUuODUwMSAzLjAxNjc1IDE1LjQ1ODMgMy41IDE1LjQ1ODNIMTIuODMzM0MxMy4zMTY2IDE1LjQ1ODMgMTMuNzA4MyAxNS44NTAxIDEzLjcwODMgMTYuMzMzM0MxMy43MDgzIDE2LjgxNjYgMTMuMzE2NiAxNy4yMDgzIDEyLjgzMzMgMTcuMjA4M0gzLjVDMy4wMTY3NSAxNy4yMDgzIDIuNjI1IDE2LjgxNjYgMi42MjUgMTYuMzMzM1pNMi42MjUgMjFDMi42MjUgMjAuNTE2OCAzLjAxNjc1IDIwLjEyNSAzLjUgMjAuMTI1SDEyLjgzMzNDMTMuMzE2NiAyMC4xMjUgMTMuNzA4MyAyMC41MTY4IDEzLjcwODMgMjFDMTMuNzA4MyAyMS40ODMyIDEzLjMxNjYgMjEuODc1IDEyLjgzMzMgMjEuODc1SDMuNUMzLjAxNjc1IDIxLjg3NSAyLjYyNSAyMS40ODMyIDIuNjI1IDIxWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg=="
                />
              </a>
              <a target="_blank" className={styles.socialIcon} href="https://www.youtube.com/channel/UCTSqa9dBButQvhLmrBBzneQ" rel="noreferrer">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path>
                </svg>
              </a>
              <a target="_blank" className={styles.socialIcon} href="https://boosty.to/risazatvorchestvo" rel="noreferrer">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" role="img" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.661 14.337 6.801 0h6.362L11.88 4.444l-.038.077-3.378 11.733h3.15c-1.321 3.289-2.35 5.867-3.086 7.733-5.816-.063-7.442-4.228-6.02-9.155M8.554 24l7.67-11.035h-3.25l2.83-7.073c4.852.508 7.137 4.33 5.791 8.952C20.16 19.81 14.344 24 8.68 24h-.127z"></path>
                </svg>
              </a>
            </div>
          </div>

          <div className={styles.infoContainer}>
            <div className={styles.copyright}>«Риса за Творчество» © 2025</div>
            <div className={styles.linksContainer}>
              <a className={styles.link} href="/contact">Обратная связь</a>
              <a className={styles.link} href="/policy-personal">Политика обработки персональных данных</a>
              <a className={styles.link} href="/user-agreement">Пользовательское соглашение</a>
            </div>
            <div className={styles.contactInfo}>
              <div>
                Техническая поддержка: <a href="mailto:support@risazatvorchestvo.com" className={styles.link}>support@risazatvorchestvo.com</a>
              </div>
              <div>
                Предложения о сотрудничестве: <a href="mailto:info@risazatvorchestvo.com" className={styles.link}>info@risazatvorchestvo.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}; 