import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { CSVLink } from "react-csv";
import { LuDownload, LuTrash2 } from "react-icons/lu";
import { Delete } from "@mui/icons-material";

import apiClient from "@/utils/apiClient";
import Button from "@/common/Button";
import Loader from "../Loader";

import Papa from "papaparse";

import { FilterState } from "@/common/SearchFilter";
import {
  Lead,
  DateFilterType,
  SavedView,
  tabLabels,
  headers,
  getUpcomingFollowUps,
  getOverdueFollowUps,
  getTodayFollowUps,
} from "./types";
import NotificationCenter from "./notificationCenter";
import SavedViewsDropdown from "./savedViewDropdown";
import LeadsOverview from "./LeadsOverview";
import LeadsDashboard from "./LeadsDashboard";
import LeadFormDrawer from "./LeadFormDrawer";
import CSVUploadModal from "./CsvUploadModal";
import { any } from "zod";
interface FormData {
  Fullname: string;
  Phonenumber: string;
  email: string;
  propertytype: string;
  bhk: string;
  city: string;
  state: string;
  serviceType: string;
  platform: string;
  leadstatus: string;
  review: string;
  houseNo?: string;
  apartmentName?: string;
  areaName?: string;
  pincode?: string;
}

interface CategorizedData {
  total: number;
  states: Record<string, number>;
}

interface StatusData {
  total: number;
  statuses: Record<string, number>;
}

interface RoleData {
  total: number;
  roles: Record<string, number>;
}

export default function CrmView() {
  const session = useSession();

  // =========== STATE ===========
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [isLeadsLoading, setIsLeadsLoading] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState<string>("OverView");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openFileModal, setOpenFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    categoryData: {},
    leaddata: {},
    propertytypedata: {},
    stateData: {},
  });
  const [formData, setFormData] = useState<FormData>({
    Fullname: "",
    Phonenumber: "",
    email: "",
    propertytype: "Flat",
    bhk: "",
    city: "",
    state: "",
    serviceType: "RealEstate",
    platform: "Walkin",
    leadstatus: "New",
    review: "",
    houseNo: "",
    apartmentName: "",
    areaName: "",
    pincode: "",
  });
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<DateFilterType>("all");
  const [customRange, setCustomRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });
  const [activeStatus, setActiveStatus] = useState("all");

  // Saved Views
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [isSaveViewOpen, setIsSaveViewOpen] = useState(false);

  // Lead Management
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  // Stats
  const [todayLeadsCount, setTodayLeadsCount] = useState(0);
  const [categorized, setCategorized] = useState<CategorizedData>({
    total: 0,
    states: {},
  });
  const [statusData, setStatusData] = useState<StatusData>({
    total: 0,
    statuses: {},
  });
  const [roleData, setRoleData] = useState<RoleData>({ total: 0, roles: {} });

  // Notifications
  const [upcomingFollowUps, setUpcomingFollowUps] = useState<Lead[]>([]);
  const [overdueFollowUps, setOverdueFollowUps] = useState<Lead[]>([]);
  const [todayFollowUps, setTodayFollowUps] = useState<Lead[]>([]);

  // =========== EFFECTS ===========

  useEffect(() => {
    if (user?.id) {
      fetchTodayLeadsCount();
    }
  }, [user, activeStatus]);

  useEffect(() => {
    if (allLeads.length > 0) {
      setCategorized(categorizeLeadsByState(allLeads));
      setStatusData(categorizeLeadsByStatus(allLeads));
      setRoleData(categorizedByRoles(allLeads));

      // Update follow-up notifications
      setUpcomingFollowUps(getUpcomingFollowUps(allLeads));
      setOverdueFollowUps(getOverdueFollowUps(allLeads));
      setTodayFollowUps(getTodayFollowUps(allLeads));
    }
  }, [allLeads]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("crm_saved_views");
      if (raw) setSavedViews(JSON.parse(raw));
    } catch { }
  }, []);

  // =========== API CALLS ===========
  const filtersdata = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "last7Days", label: "Last 7 Days" },
    { id: "last14Days", label: "Last 14 Days" },
    { id: "lastMonth", label: "Last Month" },
    {
      id: "custom",
      label: "Date range",
    },
  ];

  type FilterType = (typeof filtersdata)[number]["id"];
  const fetchAllLeads = async (
    userId: number,
    filter: DateFilterType,
    customRange?: { startDate: string; endDate: string }
  ) => {
    try {
      let queryString = "";

      if (filter !== "all") {
        const { startDate, endDate } = getDateRange(filter, customRange);

        if (
          !startDate ||
          !endDate ||
          isNaN(new Date(startDate).getTime()) ||
          isNaN(new Date(endDate).getTime())
        ) {
          throw new Error("Invalid date range");
        }

        queryString = `?startDate=${encodeURIComponent(
          startDate
        )}&endDate=${encodeURIComponent(endDate)}`;
      }

      const res = await apiClient.get(
        `${apiClient.URLS.crmlead}/by-user/${userId}${queryString}`
      );

      if (res.status === 200 && res.body) {
        setAllLeads(res.body);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };
  const [roles, setRoles] = useState<any[]>([]);
  const fetchUsers = async () => {
    try {
      const res = await apiClient.get(apiClient.URLS.roles, {});
      if (res.status === 200 && res.body) {
        setRoles(res.body);
      }
    } catch (error) {
      console.error("error is ", error);
    }
  };

  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
      fetchUsers();
      fetchAllLeads(Number(session.data?.user?.id), "all");
      fetchTodayLeadsCount();
    }
  }, [session?.status]);

  const fetchTodayLeadsCount = async () => {
    try {
      if (!user?.id) return;

      const { startDate, endDate } = getDateRange("today") as {
        startDate: string;
        endDate: string;
      };

      const res = await apiClient.get(
        `${apiClient.URLS.crmlead}/by-user/${user.id
        }?startDate=${encodeURIComponent(
          startDate
        )}&endDate=${encodeURIComponent(endDate)}`
      );

      if (res.status === 200 && res.body) {
        const todayLeads = res.body;
        const todayFilteredLeads =
          activeStatus === "all"
            ? todayLeads
            : todayLeads.filter(
              (lead: Lead) =>
                lead.leadstatus?.trim().toLowerCase() ===
                activeStatus.trim().toLowerCase()
            );

        setTodayLeadsCount(todayFilteredLeads.length);
      }
    } catch (error) {
      console.error("Error fetching today's leads:", error);
    }
  };

  // =========== HELPER FUNCTIONS ===========

  function toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  type FollowUpTab = "ALL" | "TODAY" | "TOMORROW" | "NEXT_7_DAYS";

  const FOLLOW_UP_TABS: { key: FollowUpTab; label: string }[] = [
    { key: "ALL", label: "All Leads" },
    { key: "TODAY", label: "Today Follow-ups" },
    { key: "TOMORROW", label: "Tomorrow Follow-ups" },
    { key: "NEXT_7_DAYS", label: "Next 7 Days" },
  ];

  const startOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const [followUpTab, setFollowUpTab] = useState<FollowUpTab>("ALL");

  const getLeadFollowUpDate = (lead: any): Date | null => {
    const raw = lead.followUpDate || null;

    if (!raw) return null;

    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    return d;
  };

  const displayLeads = useMemo(() => {
    if (!allLeads || !Array.isArray(allLeads)) return [];

    if (followUpTab === "ALL") {
      return allLeads;
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    return allLeads.filter((lead) => {
      const followDate = getLeadFollowUpDate(lead);
      if (!followDate) return false;

      if (followUpTab === "TODAY") {
        return followDate >= todayStart && followDate <= todayEnd;
      }

      if (followUpTab === "TOMORROW") {
        const tomorrowStart = startOfDay(addDays(now, 1));
        const tomorrowEnd = endOfDay(addDays(now, 1));
        return followDate >= tomorrowStart && followDate <= tomorrowEnd;
      }

      if (followUpTab === "NEXT_7_DAYS") {
        // const start = startOfDay(addDays(now, 1));
        // const end = endOfDay(addDays(now, 7));
        // return followDate >= start && followDate <= end;
        const start = startOfDay(addDays(now, 2));
        const end = endOfDay(addDays(now, 7));
        return followDate >= start && followDate <= end;
      }

      return true;
    });
  }, [allLeads, followUpTab]);

  function getDateRange(
    filter: DateFilterType,
    customRange?: { startDate: string; endDate: string }
  ) {
    if (filter === "all") {
      return { startDate: null, endDate: null };
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.setHours(23, 59, 59, 999));

    switch (filter) {
      case "today":
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        startDate = todayStart;
        endDate = todayEnd;
        break;

      case "yesterday":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;

      case "last7Days":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;

      case "last14Days":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 14);
        startDate.setHours(0, 0, 0, 0);
        break;

      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case "custom":
        if (!customRange)
          throw new Error("Custom range requires start and end dates");
        startDate = new Date(customRange.startDate);
        endDate = new Date(customRange.endDate);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid custom date range");
        }
        break;

      default:
        throw new Error("Invalid filter type");
    }

    return {
      startDate: toLocalDateString(startDate!),
      endDate: toLocalDateString(endDate),
    };
  }

  const categorizeLeadsByState = (leads: Lead[]) => {
    const result: CategorizedData = {
      total: leads?.length,
      states: {},
    };

    leads.forEach((lead) => {
      const state = lead.state?.trim().toLowerCase() || "unknown";
      if (result.states[state]) {
        result.states[state] += 1;
      } else {
        result.states[state] = 1;
      }
    });

    return result;
  };

  const categorizeLeadsByStatus = (leads: Lead[]): StatusData => ({
    total: leads?.length || 0,
    statuses: leads?.reduce((acc: Record<string, number>, { leadstatus }) => {
      const status = leadstatus?.trim() || "New";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}),
  });

  const categorizedByRoles = (leads: Lead[]): RoleData => {
    const result: RoleData = { total: leads.length, roles: {} };

    leads.forEach((lead) => {
      const role = lead.serviceType || "unknown";
      if (result.roles[role]) {
        result.roles[role] += 1;
      } else {
        result.roles[role] = 1;
      }
    });

    return result;
  };

  // =========== SAVED VIEWS ===========

  const persistViews = (views: SavedView[]) => {
    setSavedViews(views);
    try {
      localStorage.setItem("crm_saved_views", JSON.stringify(views));
    } catch { }
  };

  const saveCurrentView = (viewName: string) => {
    if (!viewName.trim()) {
      toast.error("Give this view a name");
      return;
    }

    const view: SavedView = {
      id: crypto?.randomUUID?.() || String(Date.now()),
      name: viewName.trim(),
      searchQuery,
      selectedFilters,
      selectedDateFilter,
      customRange,
      activeStatus,
    };

    persistViews([view, ...savedViews]);
    setIsSaveViewOpen(false);
    toast.success("View saved");
  };

  const applySavedView = (view: SavedView) => {
    setSearchQuery(view.searchQuery);
    setSelectedFilters(view.selectedFilters);
    setSelectedDateFilter(view.selectedDateFilter);
    setCustomRange(view.customRange);
    setActiveStatus(view.activeStatus);
    toast.success(`Applied view: ${view.name}`);
  };

  const deleteSavedView = (id: string) => {
    persistViews(savedViews.filter((v) => v.id !== id));
    toast.success("View deleted");
  };

  // =========== DELETE OPERATIONS ===========

  const handleDeleteSelected = async () => {
    if (selectedLeads.length === 0) {
      return;
    }

    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.crmlead}/bulk?ids=${selectedLeads.join(",")}`,
        true
      );

      const remainingLeads = allLeads.filter(
        (lead) => !selectedLeads.includes(lead.id)
      );

      if (res.status === 200) {
        setAllLeads(remainingLeads);
        setSelectedLeads([]);
        toast.success("Leads deleted successfully");
      } else {
        console.error("Failed to delete selected leads", res);
        toast.error("Failed to delete leads");
      }
    } catch (error) {
      console.error("Failed to delete selected leads", error);
      toast.error("Error deleting leads");
    }
  };

  // =========== FILE UPLOAD ===========

  // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;

  //   if (!file.name.endsWith(".csv")) {
  //     toast.error("Please upload a CSV file");
  //     return;
  //   }

  //   setSelectedFile(file);
  // };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setSelectedFile(file);
  };
  const [isleadsLoading, setIsleadsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsleadsLoading(true);
    setUploadProgress(0);

    try {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 20;
        });
      }, 400);

      const formattedData = await parseCSV(selectedFile);

      await sendDataToBackend(formattedData);

      setTimeout(() => {
        setUploadProgress(100);
        setTimeout(() => {
          setOpenFileModal(false);
        }, 800);
      }, 500);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing CSV file");
    } finally {
      setIsleadsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const propertyTypeMap = {
    flat: "Flat",
    villa: "Villa",
    independent_house: "Independent House",
    independent_floor: "Independent Floor",
  };

  const parseCSV = (file: any) => {
    const headerMap = {
      platform: "platform",
      propertytype: "propertytype",
      bhk: "bhk",
      fullname: "Fullname",
      phonenumber: "Phonenumber",
      email: "email",
      city: "city",
      state: "state",
      role: "role",
      review: "review",
      leadstatus: "leadstatus",
      assignby: "assignBy",
      assignto: "assignTo",
      date: "date",
      phase: "phase",
    };

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result: any) => {
          try {
            const formattedData = result.data
              .filter(
                (row: any) => row.Fullname || row.Phonenumber || row.email
              )
              .map((row: any) => {
                const normalizedRow: Record<string, any> = {};

                for (const originalKey in row) {
                  if (originalKey) {
                    const cleanKey = originalKey
                      ?.trim()
                      .toLowerCase()
                      .replace(/\s+/g, "");
                    const mappedKey =
                      headerMap[cleanKey as keyof typeof headerMap];
                    if (mappedKey) {
                      normalizedRow[mappedKey] =
                        row[originalKey]?.toString().trim() || "";
                    }
                  }
                }
                type PropertyTypeKeys = keyof typeof propertyTypeMap;
                const propKey = normalizedRow["propertytype"]?.toLowerCase() as
                  | PropertyTypeKeys
                  | undefined;

                let parsedDate = new Date();
                const dateStr = normalizedRow["date"];
                if (dateStr && /^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
                  const [day, month, year] = dateStr.split("-").map(Number);
                  parsedDate = new Date(year, month - 1, day);
                }

                return {
                  Fullname: normalizedRow["Fullname"] || "",
                  Phonenumber: normalizedRow["Phonenumber"] || "",
                  email: normalizedRow["email"] || "",
                  propertytype: propKey ? propertyTypeMap[propKey] : null,
                  bhk: normalizedRow["bhk"]
                    ? Number(normalizedRow["bhk"])
                    : null,
                  city: normalizedRow["city"] || "",
                  state: normalizedRow["state"] || "",
                  platform: normalizedRow["platform"] || "",
                  role: normalizedRow["role"] || null,
                  review: normalizedRow["review"] || "",
                  leadstatus: normalizedRow["leadstatus"] || "New",
                  assignBy: normalizedRow["assignBy"]
                    ? Number(normalizedRow["assignBy"])
                    : null,
                  assignTo: normalizedRow["assignTo"]
                    ? Number(normalizedRow["assignTo"])
                    : null,
                  date: parsedDate.toISOString(),
                  phase: normalizedRow["phase"]
                    ? Number(normalizedRow["phase"])
                    : null,
                };
              });

            sendDataToBackend(formattedData);
            resolve(formattedData);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  };

  const sendDataToBackend = async (data: any) => {
    try {
      if (!data.length) {
        toast.error("No valid data found in CSV");
        return;
      }

      const response = await apiClient.post(
        `${apiClient.URLS.crmlead}/bulk`,
        {
          leads: data,

          createdById: session?.data?.user.id,
        },
        true
      );

      if (response.data) {
        setAllLeads((prevLeads) => [...prevLeads, ...response.data]);
        toast.success("Leads added successfully");
      }
    } catch (error) {
      console.error("Error uploading leads:", error);
      toast.error("Failed to upload leads");
      throw error;
    }
  };

  // =========== FILTERS ===========

  function applyFilter() {
    try {
      let range;
      if (selectedDateFilter === "custom") {
        if (!customRange.startDate || !customRange.endDate) {
          toast.error("Please select both start and end dates");
          return;
        }
        range = {
          startDate: customRange.startDate,
          endDate: customRange.endDate,
        };
      }

      const { startDate, endDate } = getDateRange(selectedDateFilter, range);

      if (user?.id) {
        fetchAllLeads(user.id, selectedDateFilter, {
          startDate: startDate!,
          endDate: endDate!,
        });
      }
    } catch (err) {
      console.error("error", err);
      toast.error("Invalid date range");
    }
  }

  // =========== RENDER ===========

  if (isLeadsLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
        <div className="p-6 max-w-[100%] w-full">
          <Loader />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen overflow-auto max-w-[1300px]">
      {/* Header */}
      <div className="flex items-center justify-between md:mb-4 mb-3">
        <h1 className="heading-text">Customer Relationship Management</h1>

        <div className="flex items-center gap-2">
          <NotificationCenter
            upcomingFollowUps={upcomingFollowUps}
            overdueFollowUps={overdueFollowUps}
            todayFollowUps={todayFollowUps}
          />

          <SavedViewsDropdown
            savedViews={savedViews}
            onSave={saveCurrentView}
            onApply={applySavedView}
            onDelete={deleteSavedView}
            isSaveViewOpen={isSaveViewOpen}
            setIsSaveViewOpen={setIsSaveViewOpen}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center md:gap-4 gap-1 mt-5 md:mb-3 mb-2">
        {tabLabels.map((item: any) => (
          <Button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`md:px-4 py-1 px-2 md:py-1 max-md:text-nowrap rounded-md transform uppercase text-[10px] md:text-[12px] font-Gordita-Bold flex items-center gap-2 ${activeTab === item.key
              ? "bg-[#2872a1] text-white"
              : "bg-gray-200 text-gray-600"
              }`}
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </div>

      <p className="md:text-[16px] text-[12px] font-Gordita-Bold">
        {activeTab === "OverView" ? "Leads Overview" : "Analytics Dashboard"}
      </p>
      {activeTab === "OverView" && (
        <div className="flex items-center overflow-x-auto md:gap-3 gap-1 mb-2 md:mt-4 mt-2 px-2 md:px-4 py-2">
          {FOLLOW_UP_TABS.map((tab) => (
            <Button
              key={tab.key}
              onClick={() => setFollowUpTab(tab.key)}
              className={`md:px-3 px-2 py-1 text-nowrap rounded-md text-[10px] md:text-[12px] font-Gordita-Medium ${followUpTab === tab.key
                ? "bg-[#2872a1] text-white"
                : "bg-gray-200 text-gray-600"
                }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      )}

      {/* Main Content */}
      {activeTab === "OverView" ? (
        <LeadsOverview
          allLeads={displayLeads}
          setAllLeads={setAllLeads}
          user={user}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          selectedDateFilter={selectedDateFilter}
          setSelectedDateFilter={setSelectedDateFilter}
          customRange={customRange}
          setCustomRange={setCustomRange}
          activeStatus={activeStatus}
          setActiveStatus={setActiveStatus}
          categorized={categorized}
          statusData={statusData}
          roleData={roleData}
          todayLeadsCount={todayLeadsCount}
          selectedLeads={selectedLeads}
          setSelectedLeads={setSelectedLeads}
          openModal={openModal}
          setOpenModal={setOpenModal}
          openFileModal={openFileModal}
          setOpenFileModal={setOpenFileModal}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          handleFileUpload={handleFileUpload}
          handleUpload={handleUpload}
          applyFilter={applyFilter}
          fileInputRef={fileInputRef}
          formData={formData}
          setFormData={setFormData}
          selectedLeadId={selectedLeadId}
          setSelectedLeadId={setSelectedLeadId}
        />
      ) : (
        <LeadsDashboard allLeads={allLeads} />
      )}

      {/* Delete Selected Button */}
      {selectedLeads.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            className="bg-red-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-red-600 transition-all"
            onClick={handleDeleteSelected}
          >
            <Delete className="mr-2" />
            Delete {selectedLeads.length} Lead
            {selectedLeads.length > 1 ? "s" : ""}
          </Button>
        </div>
      )}

      {/* CSV Export */}
      <div className="hidden">
        <CSVLink
          data={allLeads}
          headers={headers}
          filename={`theimprovementllc-leads-${new Date().toISOString().split("T")[0]
            }.csv`}
        >
          Export
        </CSVLink>
      </div>

      {/* Modals */}
      <LeadFormDrawer
        open={openModal}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setOpenModal(false)}
        leadId={selectedLeadId}
        onSuccess={(lead) => {
          if (selectedLeadId) {
            setAllLeads((prev) =>
              prev.map((l) => (l.id === lead.id ? lead : l))
            );
          } else {
            setAllLeads((prev) => [lead, ...prev]);
          }
          setOpenModal(false);
          setSelectedLeadId(null);
        }}
      />

      <CSVUploadModal
        open={openFileModal}
        onClose={() => {
          setOpenFileModal(false);
          setSelectedFile(null);
        }}
        selectedFile={selectedFile}
        onFileSelect={handleFileUpload}
        onUpload={handleUpload}
        fileInputRef={fileInputRef}
        isLoading={isLeadsLoading}
      />
    </div>
  );
}
