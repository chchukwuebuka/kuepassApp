"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Header from "@/components/building/Header";
import styles from "./styles.module.css";
import StatsCard from "@/components/building/StatsCard";
import MemberList from "@/components/building/MembersList";
import Sidebar, { PageKey } from "@/components/building/SidebarD";
import Appearance from "@/components/building/AppearanceStep";
import MembersStep from "@/components/building/MembersStep";
import DetailsStep from "@/components/building/DetailsStep";
import Modal from "@/components/building/MembersList/membersStepModal";
import InviteTable from "@/components/building/Invite";
import InviteTables from "@/components/building/InviteTable";
import BuildingSubPage from "@/components/building/BuildingSubPage";

// Import the router and Redux logout utilities
import { useRouter } from "next/navigation";
import { logout, persistor, useAppDispatch } from "@/store/store";

interface FormValues {
  title: string;
  address: string;
}

interface Member {
  name: string;
  email: string;
  number: string;
}

export default function BuildDashboard() {
  const [activeView, setActiveView] = useState<PageKey>("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      address: "",
    },
  });

  const router = useRouter();
  const dispatch = useAppDispatch();

  // Logout effect: when activeView changes to "logout", execute logout
  useEffect(() => {
    if (activeView === "logout") {
      async function performLogout() {
        dispatch(logout());
        await persistor.purge();
        router.push("/");
      }
      performLogout();
    }
  }, [activeView, dispatch, router]);

  const onSubmit = (data: FormValues) => {
    console.log("Updated building details:", data);
    console.log("Members:", members);
    setShowEditModal(false);
    setModalStep(1);
  };

  const addMember = (member: Member) => {
    setMembers([...members, member]);
  };

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return (
          <>
            <Header />
            <StatsCard />
            <MemberList />
          </>
        );
      case "customization":
        return (
          <div className={styles.appContainer}>
            <div className={styles.appButton}>
              <button
                className={styles.appBTN}
                onClick={() => {
                  setModalStep(1);
                  setShowEditModal(true);
                }}
              >
                Edit Building Details
              </button>
            </div>
            <Appearance
              title="Customization Settings"
              address={["Address 1", "Address 2"].join(", ")}
            />
            <div className={styles.SaveWrap}>
              <p>You have unsaved changes.</p>
              <button className={styles.SaveBTN}>Save Changes</button>
            </div>
          </div>
        );
      case "invite":
        return (
          <div>
            <InviteTable />
          </div>
        );
      case "members":
        return (
          <div>
            <InviteTables />
          </div>
        );
      case "support":
        return (
          <div>
            <BuildingSubPage />
          </div>
        );
      case "logout":
        return <div>Logging out...</div>;
      default:
        return <div>Select an option from the sidebar.</div>;
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar activePage={activeView} onNavClick={setActiveView} />
      <div className={styles.main}>
        <div className={styles.content}>{renderContent()}</div>
      </div>

      <Modal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setModalStep(1);
        }}
        title="Edit Building Details"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {modalStep === 1 && (
            <div>
              <DetailsStep register={register} errors={errors} />
              <button
                type="button"
                onClick={() => setModalStep(2)}
                className={styles.nextButton}
              >
                Next
              </button>
            </div>
          )}
          {modalStep === 2 && (
            <div>
              {/* Render the MembersStep component */}
              <MembersStep addMember={addMember} />
              <div className={styles.modalButtonGroup}>
                <button
                  type="button"
                  onClick={() => setModalStep(1)}
                  className={styles.nextButton}
                >
                  Back
                </button>
                <button type="submit" className={styles.nextButton}>
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
