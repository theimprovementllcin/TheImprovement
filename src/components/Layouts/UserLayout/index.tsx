"use client";
import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import ReactTimeAgo from "react-time-ago";
import type { NextPage } from "next";
import { INavItems } from "@/utils/interfaces";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { RxCross2 } from "react-icons/rx";
import { LuCheckCircle } from "react-icons/lu";
import { MdReviews } from "react-icons/md";
import clsx from "clsx";
import { Popover, Portal, Transition } from "@headlessui/react";
import { IoChevronDown } from "react-icons/io5";
import { usePopper } from "react-popper";
import Avatar from "@/components/Avatar";
import { DropDown } from "@/common/PopOver";
import { IoMdNotificationsOutline } from "react-icons/io";
import { LuUsers } from "react-icons/lu";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import Button from "@/common/Button";
import { FiGrid, FiUser, FiHeart, FiTool, FiMenu, FiX } from "react-icons/fi";
import { FaHome, FaBuilding } from "react-icons/fa";
import apiClient from "@/utils/apiClient";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

TimeAgo.addDefaultLocale(en);
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

interface Notification {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

function UserLayout({
  page,
  showAll,
  setShowAll,
}: {
  page: ReactElement;
  showAll: boolean;
  setShowAll: (value: boolean) => void;
}) {
  const router = useRouter();
  const session = useSession();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const displayedNotifications = showAll
    ? notifications
    : notifications?.slice(0, 3);

  const navMenuItems: INavItems[] = [
    {
      name: "Dashboard",
      link: "/user/dashboard",
      icon: <FiGrid className="text-[18px]" />,
      isActive: router.asPath.startsWith("/user/dashboard"),
    },
    {
      name: "User Profile",
      link: "/user/profile",
      icon: <FiUser className="text-[18px]" />,
      isActive: router.asPath.startsWith("/user/profile"),
    },
    {
      name: "CRM",
      link: "/user/crm",
      icon: <LuUsers className="text-[18px]" />,
      isActive: router.asPath.startsWith("/user/crm"),
    },

    {
      name: "Custom builder",
      link: "/user/custom-builder",
      icon: <FiTool className="text-[18px]" />,
      isActive: router.asPath.startsWith("/user/custom-builder"),
    },

    {
      name: "Testimonials",
      link: "/user/testimonials",
      icon: <MdReviews className="text-[18px]" />,
      isActive: router.pathname === "/user/testimonials",
    },
  ];

  const logo_place_holder = {
    imageUrl: "/llclogo.png",
    link: "/",
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      await Promise.all(
        unreadNotifications.map((notification) =>
          apiClient.patch(
            `${apiClient.URLS.notifications}/mark-all/${user.id}`,
            {}
          )
        )
      );

      const updated = notifications.map((n) => ({ ...n, isRead: true }));
      setNotifications(updated);

      toast.success("All notifications marked as read");
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const fetchNotifications = async (userId: number) => {
    if (!userId) return;
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.notifications}/${userId}`
      );
      if (res.status === 200) {
        setNotifications(res.body);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Error fetching notifications");
    }
  };

  useEffect(() => {
    if (session.status === "unauthenticated") {
      const callbackUrl = encodeURIComponent(router.asPath);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [session.status, router]);

  useEffect(() => {
    if (session.status === "authenticated" && session.data?.user?.id) {
      setUser(session.data.user);
      fetchNotifications(session?.data?.user.id);
    }
  }, [session.status, session?.data?.user?.id]);

  const CommonNavItem = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={`flex h-full flex-col ${
        isMobile ? "md:p-4 p-4" : "lg:px-4 px-2 lg:py-6 py-4"
      } bg-white`}
    >
      {/* Logo */}
      <div className="z-[99999] mb-2">
        <Link href={"/"}>
          <div className="flex items-center justify-start gap-2 cursor-pointer">
            <div className="relative w-[30px] h-[30px] md:min-h-[40px] min-h-[30px]">
              <Image
                src={logo_place_holder.imageUrl}
                alt="dreamcasa-logo"
                fill
                className="absolute object-cover"
              />
            </div>
            <div className=" md:block font-Gordita-Bold leading-tight">
              <p className="flex gap-1">
                <span className="text-[18px] text-[#2872a1]"> THE</span>
                <span className="text-[18px] text-gray-900">IMPROVEMENT</span>
              </p>
              <p className="text-[11px] font-Gordita-Medium text-gray-600">
                Building Better. Every Day.
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <NavigationMenu items={navMenuItems} isMobile={isMobile} />
      </nav>

      {/* User info for mobile */}
      {isMobile && user && (
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-[#2872a1] font-Gordita-Medium">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-Gordita-Medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[280px] bg-white transform transition-transform duration-300 ease-in-out">
            <div className="flex justify-end items-center p-2 border-b border-gray-200">
              <Button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700"
              >
                <RxCross2 size={24} />
              </Button>
            </div>
            <CommonNavItem isMobile={true} />
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 flex w-full overflow-x-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-col w-64 bg-white shadow-lg z-40">
          <CommonNavItem />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-between md:px-6 px-3 py-2">
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden text-gray-600 p-2 rounded-md hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <FiMenu size={24} />
                </button>
                <h1 className="text-xl font-Gordita-Bold text-gray-900">
                  Client Dashboard
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <DropDown
                  placement="bottom-end"
                  buttonElement={
                    <div className="relative p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200 group">
                      <div className="relative">
                        <IoMdNotificationsOutline className="text-gray-600 w-6 h-6 group-hover:text-gray-800 transition-colors" />
                        {notifications?.some((n) => !n.isRead) && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                        )}
                      </div>
                    </div>
                  }
                  isOpen={isDropdownOpen}
                  setIsOpen={setIsDropdownOpen}
                >
                  <div className="md:w-96 bg-red-400 rounded-xl shadow-2xl border border-gray-100 flex flex-col max-h-96 backdrop-blur-sm bg-white/95">
                    {/* Header */}
                    <div className="flex items-center justify-between md:p-5 p-2 border-b border-gray-100">
                      <div>
                        <h3 className="font-Gordita-Bold text-gray-900 md:text-lg text-[14px]">
                          Notifications
                        </h3>
                        <p className="md:text-xs text-[10px] text-gray-500 md:mt-1">
                          {notifications.filter((n) => !n.isRead).length} unread
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {notifications?.length > 0 &&
                          notifications.some((n) => !n.isRead) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={markAllAsRead}
                              className="text-[#2872a1] hover:text-[#2872a1] hover:bg-blue-50 px-3 py-1 md:text-xs text-[12px] font-Gordita-Medium transition-colors"
                            >
                              Mark all read
                            </Button>
                          )}
                        <Button
                          onClick={() => setIsDropdownOpen(false)}
                          className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {displayedNotifications?.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {displayedNotifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`md:p-4 p-2 transition-all duration-200 hover:bg-gray-50 cursor-pointer ${
                                !notification.isRead
                                  ? "bg-blue-50 border-l-4 border-l-[#2872a1]"
                                  : ""
                              }`}
                              onClick={() => {
                                if (!notification.isRead) {
                                }
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`flex-shrink-0 md:w-8 md:h-8 w-5 h-5 rounded-full flex items-center justify-center ${
                                    !notification.isRead
                                      ? "bg-blue-100"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      !notification?.isRead
                                        ? "bg-[#2872a1]"
                                        : "bg-gray-400"
                                    }`}
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`md:text-sm text-[12px] font-Gordita-Medium mb-1 label-text ${
                                      !notification.isRead
                                        ? "text-gray-900"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {notification?.message.slice(0, 60) +
                                      (notification?.message?.length > 100
                                        ? "..."
                                        : "")}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <p className="md:text-xs text-[10px] text-gray-500">
                                      <ReactTimeAgo
                                        date={notification.createdAt}
                                        locale="en-US"
                                        timeStyle="round-minute"
                                      />
                                    </p>
                                    {!notification.isRead && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-Gordita-Medium bg-blue-100 text-[#2872a1]">
                                        New
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <IoMdNotificationsOutline className="text-gray-300 w-8 h-8" />
                          </div>
                          <h4 className="font-Gordita-Medium text-gray-900 mb-2">
                            No notifications yet
                          </h4>
                          <p className="text-sm text-gray-500 max-w-xs">
                            We'll notify you when something important happens
                          </p>
                        </div>
                      )}
                    </div>

                    {notifications.length > 3 && (
                      <div className="md:p-4 p-2 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                        <Button
                          variant="outline"
                          className="w-full justify-center py-2.5 border-gray-300 hover:border-gray-400 text-sm font-Gordita-Medium transition-colors"
                          onClick={() => setShowAll(!showAll)}
                        >
                          {showAll ? (
                            <>
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                              Show less
                            </>
                          ) : (
                            <>
                              <span className="text-[12px] text-gray-500">
                                View all Notifications
                              </span>
                              <svg
                                className="w-4 h-4 ml-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {notifications.length > 0 && (
                      <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between">
                        <button className="text-xs text-gray-500 hover:text-gray-700 font-Gordita-Medium transition-colors">
                          Notification settings
                        </button>
                        <button className="text-xs text-gray-500 hover:text-gray-700 font-Gordita-Medium transition-colors">
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                </DropDown>

                <div className="ml-2">
                  <Avatar showAbove={false} />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 md:p-6 p-2 overflow-auto">{page}</main>
        </div>
      </div>
    </>
  );
}

interface INavigationMenuProps {
  items: Array<INavItems>;
  isMobile?: boolean;
}

const NavigationMenu = ({ items, isMobile = false }: INavigationMenuProps) => {
  const popperElRef = useRef<any>(null);
  let [referenceElement, setReferenceElement] = useState<any>(null);
  let [popperElement, setPopperElement] = useState<any>(null);
  let { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "right-start",
    modifiers: [
      {
        name: "flip",
        options: {
          fallbackPlacements: ["right-start", "right", "top-end", "auto"],
        },
      },
      {
        name: "preventOverflow",
        options: {
          rootBoundary: "document",
          padding: 4,
        },
      },
    ],
    strategy: "fixed",
  });

  return (
    <ul role="list" className="space-y-2">
      {items.map((item, index) => (
        <li key={`${index}-${item.name}-link`}>
          {item.link && !item.subLink ? (
            <Link
              href={item.link}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-Gordita-Medium transition-colors",
                {
                  "text-[#2872a1] bg-blue-50 border-r-2 border-[#2872a1]":
                    item.isActive,
                  "text-gray-700 hover:text-[#2872a1] hover:bg-blue-50":
                    !item.isActive,
                }
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ) : (
            <>
              {item.subLink && item.subLink.length > 0 && (
                <Popover className="relative">
                  {({ open }) => (
                    <>
                      <Popover.Button
                        as="div"
                        ref={setReferenceElement}
                        className="w-full"
                      >
                        <button
                          className={clsx(
                            "flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-Gordita-Medium transition-colors",
                            {
                              "text-[#2872a1] bg-blue-50":
                                item.isActive || open,
                              "text-gray-700 hover:text-[#2872a1] hover:bg-blue-50":
                                !item.isActive && !open,
                            }
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.name}</span>
                          </div>
                          <IoChevronDown
                            className={clsx("transition-transform", {
                              "rotate-180": open,
                            })}
                          />
                        </button>
                      </Popover.Button>

                      {referenceElement && (
                        <Portal>
                          <div
                            ref={popperElRef}
                            style={styles.popper}
                            className="z-[999999]"
                            {...attributes.popper}
                          >
                            <Transition
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                              beforeEnter={() =>
                                setPopperElement(popperElRef.current)
                              }
                              afterLeave={() => setPopperElement(null)}
                            >
                              {popperElement && (
                                <Popover.Panel className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] py-2">
                                  {item.subLink && (
                                    <NavigationMenu
                                      items={item.subLink}
                                      isMobile={isMobile}
                                    />
                                  )}
                                </Popover.Panel>
                              )}
                            </Transition>
                          </div>
                        </Portal>
                      )}
                    </>
                  )}
                </Popover>
              )}
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

function withUserLayout(c: any) {
  c.getLayout = (page: ReactElement, props: any) => (
    <UserLayout {...props} page={page} />
  );
  return c;
}
export default withUserLayout;
