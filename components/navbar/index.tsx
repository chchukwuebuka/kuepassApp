"use client";
import React, { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState, logout, persistor, useAppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import { IconSearch, IconMenu2, IconX } from "@tabler/icons-react";
import styles from "./styles.module.css";
import { useLoadingState } from "../../store/loadingHook";

import { Avatar, Group, Image, Menu} from "@mantine/core";
import Link from "next/link";

const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { withLoading } = useLoadingState();

  // Access authentication state from Redux store
  const isLogged = useSelector((state: RootState) => state.user.isLogged);
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleLogin = useCallback(() => {
    withLoading(async () => {
      await new Promise(resolve => setTimeout(resolve, 10)); 
      router.push("/auth/signin");
      setMobileMenuOpen(false);
    });
  }, [router, withLoading]);

  const handleSignup = useCallback(() => {
    withLoading(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      router.push("/auth/signnup");
      setMobileMenuOpen(false);
    });
  }, [router, withLoading]);

  const handleLogout = useCallback(async () => {
    withLoading(async () => {
      try {
        dispatch(logout());
        await persistor.purge();
        await new Promise(resolve => setTimeout(resolve, 10)); 
        router.push("/");
        setMobileMenuOpen(false);
      } catch (error) {
        console.error("Logout failed:", error);
      }
    });
  }, [dispatch, router, withLoading]);

  const handleGoHome = useCallback(() => {
    withLoading(async () => {
      await new Promise(resolve => setTimeout(resolve, 10)); 
      router.push("/");
      setMobileMenuOpen(false);
    });
  }, [router, withLoading]);

  const handleNavLinkClick = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className={styles.navFlex}>
      {/* Logo */}
      <Link href="/" aria-label="Kuepass Home">
        <Image
          src="/images/Kuepass.svg"
          alt="Kuepass Logo"
          className={styles.kuepass}
          width={134}
          height={46}
        />
      </Link>

      {/* Search Bar */}
      <div className={styles.navSearch}>
        <span className={styles.searchIcon}>
          <IconSearch size={18} />
        </span>
        <input
          type="text"
          placeholder="Search Event"
          className={styles.searchInput}
        />
      </div>

      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        className={styles.mobileMenuButton}
        onClick={toggleMobileMenu}
        aria-expanded={mobileMenuOpen}
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
      </button>

      {/* Mobile Menu - Only shown on mobile when activated */}
      <div
        className={`${styles.mobileMenu} ${
          mobileMenuOpen ? styles.mobileMenuOpen : ""
        }`}
      >
        <nav className={styles.mobileNavLinks} aria-label="Mobile Navigation">
          <Link
            href="/"
            className={styles.mobileLink}
            onClick={handleNavLinkClick}
          >
            Home
          </Link>
          <Link
            href="/about"
            className={styles.mobileLink}
            onClick={handleNavLinkClick}
          >
            About
          </Link>
          <Link
            href="/eventSchedule/events"
            className={styles.mobileLink}
            onClick={handleNavLinkClick}
          >
            Search Event
          </Link>

          {/* Authentication Buttons for Mobile */}
          <div className={styles.mobileAuthButtons}>
            {!isLogged ? (
              <>
                <button className={styles.mobileNavBTN} onClick={handleLogin}>
                  Sign In
                </button>
                <button className={styles.mobileNavBTN1} onClick={handleSignup}>
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <div className={styles.mobileUserInfo}>
                  <Avatar
                    src={userInfo?.profilePicture || "/images/avatar.png"}
                    alt={userInfo?.name || "User avatar"}
                    radius="xl"
                    size="md"
                  />
                  <span className={styles.mobileUserName}>
                    {userInfo?.name || "User"}
                  </span>
                </div>
                <Link
                  href="/profile/profile"
                  className={styles.mobileLink}
                  onClick={handleNavLinkClick}
                >
                  Profile
                </Link>
                <button
                  className={styles.mobileLogoutButton}
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <button
                  className={styles.mobileNavBTN11}
                  onClick={handleGoHome}
                >
                  Go Home
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Original Desktop Navigation Links - Unchanged */}
      <nav className={styles.navLink} aria-label="Main Navigation">
        <Link href="/" className={styles.link}>
          Home
        </Link>
        <Link href="/about" className={styles.link}>
          About
        </Link>
        <Link href="/eventSchedule/events" className={styles.link}>
          Search Event
        </Link>
      </nav>

      {/* Original Desktop Authentication Buttons - Unchanged */}
      <div className={styles.groupBTN}>
        {!isLogged ? (
          <>
            <button className={styles.navBTN} onClick={handleLogin}>
              Sign In
            </button>
            <button className={styles.navBTN1} onClick={handleSignup}>
              Sign Up
            </button>
          </>
        ) : (
          <Group>
            <Menu
              shadow="md"
              width={200}
              position="bottom-end"
              offset={5}
              transitionProps={{ transition: "pop-top-right", duration: 150 }}
            >
              <Menu.Target>
                <button className={styles.avatarButton}>
                  <Avatar
                    src={userInfo?.profilePicture || "/images/avatar.png"}
                  />
                  <span className={styles.userName}>{userInfo?.name}</span>
                </button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item component={Link} href="/profile/profile">
                  Profile
                </Menu.Item>
                <Menu.Item onClick={handleLogout}>Logout</Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <Link href="/">
              <button className={styles.navBTN11} onClick={handleGoHome}>
                Go Home
              </button>
            </Link>
          </Group>
        )}
      </div>
    </header>
  );
};

export default Navbar;



// "use client";
// import React, { useState, useCallback } from "react";
// import { useSelector } from "react-redux";
// import { RootState, logout, persistor, useAppDispatch } from "@/store/store";
// import { useRouter } from "next/navigation";
// import { IconSearch, IconMenu2, IconX } from "@tabler/icons-react";
// import styles from "./styles.module.css";

// import { Avatar, Group, Image, Menu } from "@mantine/core";
// import Link from "next/link";

// const Navbar: React.FC = () => {
//   const dispatch = useAppDispatch();
//   const router = useRouter();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   // Access authentication state from Redux store
//   const isLogged = useSelector((state: RootState) => state.user.isLogged);
//   const userInfo = useSelector((state: RootState) => state.user.userInfo);

//   // Toggle mobile menu
//   const toggleMobileMenu = useCallback(() => {
//     setMobileMenuOpen((prev) => !prev);
//   }, []);

//   const handleLogin = useCallback(() => {
//     router.push("/auth/signin");
//     setMobileMenuOpen(false);
//   }, [router]);

//   const handleSignup = useCallback(() => {
//     router.push("/auth/signnup");
//     setMobileMenuOpen(false);
//   }, [router]);

//   const handleLogout = useCallback(async () => {
//     try {
//       dispatch(logout());
//       await persistor.purge();
//       router.push("/");
//       setMobileMenuOpen(false);
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   }, [dispatch, router]);

//   const handleGoHome = useCallback(() => {
//     router.push("/");
//     setMobileMenuOpen(false);
//   }, [router]);

//   const handleNavLinkClick = useCallback(() => {
//     setMobileMenuOpen(false);
//   }, []);

//   return (
//     <header className={styles.navFlex}>
//       {/* Logo */}
//       <Link href="/" aria-label="Kuepass Home">
//         <Image
//           src="/images/Kuepass.svg"
//           alt="Kuepass Logo"
//           className={styles.kuepass}
//           width={134}
//           height={46}
//         />
//       </Link>

//       {/* Search Bar */}
//       <div className={styles.navSearch}>
//         <span className={styles.searchIcon}>
//           <IconSearch size={18} />
//         </span>
//         <input
//           type="text"
//           placeholder="Search Event"
//           className={styles.searchInput}
//         />
//       </div>

//       {/* Mobile Menu Button - Only visible on mobile */}
//       <button
//         className={styles.mobileMenuButton}
//         onClick={toggleMobileMenu}
//         aria-expanded={mobileMenuOpen}
//         aria-label="Toggle navigation menu"
//       >
//         {mobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
//       </button>

//       {/* Mobile Menu - Only shown on mobile when activated */}
//       <div
//         className={`${styles.mobileMenu} ${
//           mobileMenuOpen ? styles.mobileMenuOpen : ""
//         }`}
//       >
//         <nav className={styles.mobileNavLinks} aria-label="Mobile Navigation">
//           <Link
//             href="/"
//             className={styles.mobileLink}
//             onClick={handleNavLinkClick}
//           >
//             Home
//           </Link>
//           <Link
//             href="/about"
//             className={styles.mobileLink}
//             onClick={handleNavLinkClick}
//           >
//             About
//           </Link>
//           <Link
//             href="/eventSchedule/events"
//             className={styles.mobileLink}
//             onClick={handleNavLinkClick}
//           >
//             Search Event
//           </Link>

//           {/* Authentication Buttons for Mobile */}
//           <div className={styles.mobileAuthButtons}>
//             {!isLogged ? (
//               <>
//                 <button className={styles.mobileNavBTN} onClick={handleLogin}>
//                   Sign In
//                 </button>
//                 <button className={styles.mobileNavBTN1} onClick={handleSignup}>
//                   Sign Up
//                 </button>
//               </>
//             ) : (
//               <>
//                 <div className={styles.mobileUserInfo}>
//                   <Avatar
//                     src={userInfo?.profilePicture || "/images/avatar.png"}
//                     alt={userInfo?.name || "User avatar"}
//                     radius="xl"
//                     size="md"
//                   />
//                   <span className={styles.mobileUserName}>
//                     {userInfo?.name || "User"}
//                   </span>
//                 </div>
//                 <Link
//                   href="/profile/profile"
//                   className={styles.mobileLink}
//                   onClick={handleNavLinkClick}
//                 >
//                   Profile
//                 </Link>
//                 <button
//                   className={styles.mobileLogoutButton}
//                   onClick={handleLogout}
//                 >
//                   Logout
//                 </button>
//                 <button
//                   className={styles.mobileNavBTN11}
//                   onClick={handleGoHome}
//                 >
//                   Go Home
//                 </button>
//               </>
//             )}
//           </div>
//         </nav>
//       </div>

//       {/* Original Desktop Navigation Links - Unchanged */}
//       <nav className={styles.navLink} aria-label="Main Navigation">
//         <Link href="/" className={styles.link}>
//           Home
//         </Link>
//         <Link href="/about" className={styles.link}>
//           About
//         </Link>
//         <Link href="/eventSchedule/events" className={styles.link}>
//           Search Event
//         </Link>
//       </nav>

//       {/* Original Desktop Authentication Buttons - Unchanged */}
//       <div className={styles.groupBTN}>
//         {!isLogged ? (
//           <>
//             <button className={styles.navBTN} onClick={handleLogin}>
//               Sign In
//             </button>
//             <button className={styles.navBTN1} onClick={handleSignup}>
//               Sign Up
//             </button>
//           </>
//         ) : (
//           <Group>
//             <Menu
//               shadow="md"
//               width={200}
//               position="bottom-end"
//               offset={5}
//               transitionProps={{ transition: "pop-top-right", duration: 150 }}
//             >
//               <Menu.Target>
//                 <button className={styles.avatarButton}>
//                   <Avatar
//                     src={userInfo?.profilePicture || "/images/avatar.png"}
//                   />
//                   <span className={styles.userName}>{userInfo?.name}</span>
//                 </button>
//               </Menu.Target>
//               <Menu.Dropdown>
//                 <Menu.Item component={Link} href="/profile/profile">
//                   Profile
//                 </Menu.Item>
//                 <Menu.Item onClick={handleLogout}>Logout</Menu.Item>
//               </Menu.Dropdown>
//             </Menu>
//             <Link href="/">
//               <button className={styles.navBTN11} onClick={handleGoHome}>
//                 Go Home
//               </button>
//             </Link>
//           </Group>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Navbar;
