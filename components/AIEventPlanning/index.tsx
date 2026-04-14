import React, { useState, useEffect } from "react";
import { Loader, Alert, Center, TextInput, Textarea, Select, Modal } from "@mantine/core";
import { useRouter } from "next/navigation";
import { authenticatedRequest } from "@/app/services/auth";
import { FaMagic, FaCalendarCheck, FaPlus, FaCheckCircle, FaArrowRight, FaSave, FaFolderOpen, FaMapMarkerAlt, FaPhone, FaTimes } from "react-icons/fa";
import styles from "./styles.module.css";

interface AIEventPlanningProps {
  eventId?: string;
}

interface TimelineItem {
  time: string;
  activity: string;
  description: string;
  duration: string;
}

interface FlowPlan {
  id: string;
  timeline_data: TimelineItem[];
  created_at: string | null;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

const EVENT_TYPES = [
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday" },
  { value: "corporate", label: "Corporate Event" },
  { value: "conference", label: "Conference" },
  { value: "seminar", label: "Seminar" },
  { value: "workshop", label: "Workshop" },
  { value: "concert", label: "Concert" },
  { value: "festival", label: "Festival" },
  { value: "party", label: "Party" },
  { value: "networking", label: "Networking Event" },
  { value: "exhibition", label: "Exhibition" },
  { value: "sports", label: "Sports Event" },
  { value: "charity", label: "Charity Event" },
  { value: "religious", label: "Religious Event" },
  { value: "graduation", label: "Graduation" },
  { value: "anniversary", label: "Anniversary" },
  { value: "launch", label: "Product Launch" },
  { value: "other", label: "Other" },
];

export default function AIEventPlanning({ eventId }: AIEventPlanningProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!eventId);
  
  // Wizard steps: 1 = Form, 2 = Vendors/Budget, 3 = Timeline Flow, 4 = Saved Success
  const [step, setStep] = useState(1);
  const [generatingVendors, setGeneratingVendors] = useState(false);
  const [generatingFlow, setGeneratingFlow] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  
  const [vendorPlan, setVendorPlan] = useState<any>(null);
  const [selectedVendors, setSelectedVendors] = useState<Record<string, any>>({});
  const [flowPlan, setFlowPlan] = useState<FlowPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [showSavedPlansModal, setShowSavedPlansModal] = useState(false);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [viewingVendor, setViewingVendor] = useState<{category: string, vendor: any} | null>(null);
  const [drawerPackages, setDrawerPackages] = useState<string[]>([]);

  useEffect(() => {
    if (viewingVendor) {
      setDrawerPackages(selectedVendors[viewingVendor.category]?.chosen_packages || []);
    } else {
      setDrawerPackages([]);
    }
  }, [viewingVendor, selectedVendors]);


  const fetchSavedPlans = async () => {
    setLoadingPlans(true);
    try {
      const response = await authenticatedRequest<any>(
        `${API_BASE_URL}/events/saved-ai-plans/`,
        "GET"
      );
      if (response && Array.isArray(response.results)) {
        setSavedPlans(response.results);
      } else if (Array.isArray(response)) {
        setSavedPlans(response);
      }
    } catch (err) {
      console.error("Failed to fetch saved plans", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    if (showSavedPlansModal) {
      fetchSavedPlans();
    }
  }, [showSavedPlansModal]);

  const loadPlan = (plan: any) => {
    setFormData({
      title: plan.title || "",
      event_type: plan.event_type || "conference",
      location: plan.location || "Lagos",
      guest_count: plan.guest_count?.toString() || "100",
      budget: plan.budget?.toString() || "500000",
      description: plan.description || "",
      start_date: "",
      end_date: ""
    });
    
    if (plan.vendor_plan_data) {
      setVendorPlan({ budget_breakdown: plan.vendor_plan_data.breakdown });
      if (plan.vendor_plan_data.selected_vendors) {
        setSelectedVendors(plan.vendor_plan_data.selected_vendors);
      }
    }
    
    if (plan.timeline_data && Array.isArray(plan.timeline_data)) {
      setFlowPlan({ id: "loaded", timeline_data: plan.timeline_data, created_at: null });
    }
    
    setShowSavedPlansModal(false);
    setStep(3);
  };

  const [formData, setFormData] = useState({
    title: "",
    event_type: "conference",
    description: "",
    location: "Lagos",
    start_date: "",
    end_date: "",
    guest_count: "100",
    budget: "500000",
  });

  const [isRestoring, setIsRestoring] = useState(true);

  // Restore draft from local storage
  useEffect(() => {
    if (!eventId && typeof window !== "undefined") {
      const savedDraft = localStorage.getItem("kuepass_ai_planner_draft");
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.step) setStep(parsed.step);
          if (parsed.formData) setFormData(parsed.formData);
          if (parsed.vendorPlan) setVendorPlan(parsed.vendorPlan);
          if (parsed.selectedVendors) setSelectedVendors(parsed.selectedVendors);
          if (parsed.flowPlan) setFlowPlan(parsed.flowPlan);
        } catch (e) {}
      }
    }
    setIsRestoring(false);
  }, [eventId]);

  // Save draft continuously
  useEffect(() => {
    if (!eventId && !isRestoring && typeof window !== "undefined") {
      const draft = { step, formData, vendorPlan, selectedVendors, flowPlan };
      localStorage.setItem("kuepass_ai_planner_draft", JSON.stringify(draft));
    }
  }, [step, formData, vendorPlan, selectedVendors, flowPlan, eventId, isRestoring]);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    const fetchFlowPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await authenticatedRequest<any>(
          `${API_BASE_URL}/events/${eventId}/generate-event-flow/`,
          "GET"
        );
        if (response?.success && response.flow_plan) {
          setFlowPlan(response.flow_plan);
          setStep(3);
        }
      } catch (err: any) {
        if (err.status !== 404 && err.message?.indexOf("404") === -1) {
          setError("Failed to fetch existing timeline.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFlowPlan();
  }, [eventId]);

  const findVendorsAndBudget = async () => {
    setGeneratingVendors(true);
    setError(null);
    try {
      const vendorPlanPayload = {
        event_type: formData.event_type,
        guest_count: parseInt(formData.guest_count) || 100,
        budget: parseInt(formData.budget) || 500000,
        location: formData.location || "Lagos"
      };
      const vendorResponse = await authenticatedRequest<any>(
        `${API_BASE_URL}/events/generate-plan/`,
        "POST",
        vendorPlanPayload
      );
      if (vendorResponse && !vendorResponse.error) {
        setVendorPlan(vendorResponse);
        setStep(2); // Move to Vendor Selection Step
      } else {
        setError(vendorResponse?.error || "Failed to generate vendors.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred fetching vendors.");
    } finally {
      setGeneratingVendors(false);
    }
  };

  const toggleVendorSelection = (category: string, vendor: any) => {
    setSelectedVendors(prev => {
      const isAlreadySelected = prev[category]?.id === vendor.id;
      if (isAlreadySelected) {
        const next = { ...prev };
        delete next[category];
        return next;
      }
      return { ...prev, [category]: vendor };
    });
  };

  const generateTimeline = async () => {
    setGeneratingFlow(true);
    setError(null);
    try {
      const url = eventId 
        ? `${API_BASE_URL}/events/${eventId}/generate-event-flow/`
        : `${API_BASE_URL}/ai/generate-event-flow/`;
      
      const payload = eventId ? {} : {
        ...formData,
        selected_vendors: selectedVendors // send selected vendors to guide AI if we want
      };

      const flowResponse = await authenticatedRequest<any>(
        url, "POST", payload
      );
      
      if (flowResponse?.success && flowResponse.flow_plan) {
        setFlowPlan(flowResponse.flow_plan);
        setStep(3); // Move to Timeline Step
      } else {
        setError(flowResponse?.message || flowResponse?.error || "Failed to generate timeline");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred generating the timeline.");
    } finally {
      setGeneratingFlow(false);
    }
  };

  const saveAiPlan = async () => {
    setSavingPlan(true);
    setError(null);
    try {
      const payload = {
        title: formData.title,
        event_type: formData.event_type,
        location: formData.location,
        guest_count: parseInt(formData.guest_count) || 100,
        budget: parseInt(formData.budget) || 500000,
        description: formData.description,
        vendor_plan_data: { 
          budget_breakdown: vendorPlan?.budget_breakdown || [], 
          vendor_suggestions: Object.keys(selectedVendors).length > 0 ? selectedVendors : (vendorPlan?.vendor_suggestions || {}),
          ticket_suggestions: vendorPlan?.ticket_suggestions || []
        },
        timeline_data: flowPlan?.timeline_data || []
      };

      const response = await authenticatedRequest<any>(
        `${API_BASE_URL}/events/saved-ai-plans/`,
        "POST",
        payload
      );
      
      if (response && response.id) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("kuepass_ai_planner_draft");
        }
        setStep(4); // Success step
      } else {
        setError("Failed to save plan.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred saving the plan.");
    } finally {
      setSavingPlan(false);
    }
  };

  if (loading || isRestoring) {
    return (
      <Center style={{ height: "300px" }}>
        <Loader size="xl" />
      </Center>
    );
  }

  const isPreviewMode = !eventId;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.headerTitle} style={{ margin: 0 }}>AI Event Build Flow</h1>
          {isPreviewMode && (
            <div className={styles.headerActions}>
              {(step > 1 || formData.title) && step !== 4 && (
                <button 
                  className={styles.secondaryBtn} 
                  onClick={() => {
                    if (confirm("Reset current draft and start a new plan?")) {
                      localStorage.removeItem("kuepass_ai_planner_draft");
                      setStep(1);
                      setFormData({
                        title: "", event_type: "conference", description: "", location: "Lagos",
                        start_date: "", end_date: "", guest_count: "100", budget: "500000",
                      });
                      setVendorPlan(null);
                      setSelectedVendors({});
                      setFlowPlan(null);
                    }
                  }}
                >
                  <FaPlus /> New Event
                </button>
              )}
              <button 
                className={styles.secondaryBtn}
                onClick={() => setShowSavedPlansModal(true)}
              >
                <FaFolderOpen /> My Saved Plans
              </button>
            </div>
          )}
        </div>
        <p className={styles.headerSubtitle}>
          {step === 1 && "Step 1: Ideation. Describe your event details."}
          {step === 2 && "Step 2: Service Providers. Select your desired vendors based on budget."}
          {step === 3 && "Step 3: Event Flow. Review your AI-generated itinerary."}
          {step === 4 && "AI Plan Saved Successfully!"}
        </p>
      </header>

      {error && (
        <Alert color="red" title="Error" mb="md">
          {error}
        </Alert>
      )}

      <Modal
        opened={showSavedPlansModal}
        onClose={() => setShowSavedPlansModal(false)}
        title={<span style={{ fontWeight: 800, fontSize: "1.2rem", color: "#111827" }}>My Saved AI Plans</span>}
        size="lg"
        centered
        overlayProps={{ opacity: 0.55, blur: 3 }}
      >
        {loadingPlans ? (
          <Center style={{ height: "150px" }}><Loader /></Center>
        ) : savedPlans.length === 0 ? (
          <div className={styles.emptyState} style={{ padding: "30px 20px" }}>
            <p style={{ color: "#6b7280" }}>You don't have any saved plans yet.</p>
          </div>
        ) : (
          <div className={styles.savedPlansGrid}>
            {savedPlans.map(plan => (
              <div key={plan.id} className={styles.savedPlanCard}>
                <div className={styles.planCardInfo}>
                  <h4>{plan.title || "Untitled Plan"}</h4>
                  <p>
                    <span className={styles.planBadge}>{plan.event_type}</span>
                    <span>₦{(Number(plan.budget) || 0).toLocaleString()}</span>
                  </p>
                </div>
                <button 
                  className={styles.generateBtn} 
                  style={{ padding: "8px 16px" }}
                  onClick={() => loadPlan(plan)}
                >
                  Load Plan
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* STEP 1: FORM */}
      {step === 1 && isPreviewMode && (
        <div className={styles.card}>
          <h2 style={{ margin: "0 0 24px 0", color: "#111827" }}>Provide Event Details</h2>
          <div className={styles.formGrid}>
            <div className={styles.fullWidth}>
              <TextInput 
                label="Event Title" 
                placeholder="e.g., Tech Startup Conference 2026"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                size="md"
              />
            </div>
            <Select 
              label="Event Type" 
              placeholder="Select an event type"
              data={EVENT_TYPES}
              value={formData.event_type}
              onChange={(val) => setFormData({...formData, event_type: val || "conference"})}
              searchable
              size="md"
            />
            <TextInput 
              label="Location" 
              placeholder="e.g., Lagos, Nigeria"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              size="md"
            />
            <TextInput 
              label="Estimated Budget (NGN)" 
              placeholder="e.g., 500000"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              size="md"
            />
            <TextInput 
              label="Guest Count" 
              placeholder="e.g., 100"
              type="number"
              value={formData.guest_count}
              onChange={(e) => setFormData({...formData, guest_count: e.target.value})}
              size="md"
            />
            <TextInput 
              label="Approx. Start Time" 
              placeholder="e.g., 9:00 AM"
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              size="md"
            />
            <TextInput 
              label="Approx. End Time" 
              placeholder="e.g., 5:00 PM"
              value={formData.end_date}
              onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              size="md"
            />
            <div className={styles.fullWidth}>
              <Textarea 
                label="Description" 
                placeholder="Describe the main goal of the event..."
                minRows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                size="md"
              />
            </div>
            <div className={styles.fullWidth} style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
              <button 
                className={styles.generateBtn} 
                onClick={findVendorsAndBudget} 
                disabled={generatingVendors || !formData.title}
              >
                {generatingVendors ? <Loader size="xs" color="white" /> : <FaMagic />}
                {generatingVendors ? "Analyzing Budget & Vendors..." : "Find Vendors & Budget"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: VENDORS */}
      {step === 2 && vendorPlan && (
        <>
          <div className={styles.card} style={{ marginBottom: "16px", padding: "20px" }}>
             <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem" }}>Compact Budget Summary</h3>
             <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
               {vendorPlan.budget_breakdown?.map((cat: any, i: number) => (
                 <div key={i} style={{ background: "#f3f4f6", padding: "8px 16px", borderRadius: "8px", fontSize: "0.9rem" }}>
                   <strong>{cat.category}:</strong> {cat.amount}
                 </div>
               ))}
             </div>
          </div>

          <div className={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ margin: "0 0 8px 0", color: "#111827" }}>Suggested Vendors</h2>
                <p style={{ color: "#6b7280", margin: 0 }}>Select the vendors you want to hire. They are matched mathematically to your budget.</p>
              </div>
              <button 
                className={styles.generateBtn} 
                onClick={generateTimeline} 
                disabled={generatingFlow}
              >
                {generatingFlow ? <><Loader size="xs" color="white" /> Generating Flow...</> : <>Proceed to Flow <FaArrowRight /></>}
              </button>
            </div>
            
            <div className={styles.vendorSection}>
              {(!vendorPlan.vendor_suggestions && Object.keys(selectedVendors).length > 0) && (
                <Alert color="blue" mb="md" style={{ borderRadius: "8px" }}>
                  <span style={{ fontWeight: 600 }}>Restored Draft:</span> Showing the specific vendors you selected previously when saving this plan.
                </Alert>
              )}
              {Object.keys(vendorPlan.vendor_suggestions || selectedVendors || {}).map((category) => {
                const vendors = vendorPlan.vendor_suggestions 
                  ? vendorPlan.vendor_suggestions[category] 
                  : [selectedVendors[category]].filter(Boolean);
                  
                if (!vendors || vendors.length === 0) return null;
                
                return (
                  <div key={category} className={styles.vendorCategory}>
                    <h3 className={styles.vendorCatTitle}>{category}</h3>
                    <div className={styles.vendorGrid}>
                      {vendors.map((vendor: any) => {
                         const matchedService = vendor.services?.find((s: any) => s.service_type?.toLowerCase() === category.toLowerCase());
                         const priceMax = matchedService?.price_max || vendor.services?.[0]?.price_max || 0;
                         
                         const isSelected = selectedVendors[category]?.id === vendor.id;
                         
                         return (
                          <div 
                            key={vendor.id} 
                            className={`${styles.vendorCard} ${isSelected ? styles.vendorCardSelected : ''}`}
                            onClick={() => setViewingVendor({ category, vendor })}
                          >
                            <div className={styles.checkIcon}>
                              <FaCheckCircle />
                            </div>
                            <h4 className={styles.vendorName}>{vendor.business_name}</h4>
                            <div className={styles.vendorRating}>
                              ★ {Number(vendor.average_rating || 0).toFixed(1)}
                            </div>
                            <p className={styles.vendorPrice}>
                              <span style={{fontWeight: 700, color: "#10b981"}}>₦{Number(priceMax).toLocaleString()}</span> Estimated Max
                            </p>
                          </div>
                         );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* STEP 3: TIMELINE (EVENT FLOW) */}
      {step === 3 && flowPlan && (
        <div className={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
            <div>
              <h2 style={{ margin: 0, color: "#111827", fontSize: "1.5rem", fontWeight: 800 }}>Day-of Timeline</h2>
              <p style={{ margin: "6px 0 0 0", color: "#6b7280" }}>
                Your highly professional event flow schedule. Review and save your plan.
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button 
                className={styles.secondaryBtn} 
                onClick={() => setStep(2)} 
              >
                Back to Vendors
              </button>

              {isPreviewMode && (
                <button 
                  className={styles.successBtn} 
                  onClick={saveAiPlan}
                  disabled={savingPlan}
                >
                  {savingPlan ? <Loader size="xs" color="white" /> : <FaSave />}
                  {savingPlan ? "Saving..." : "Review & Save AI Plan"}
                </button>
              )}
            </div>
          </div>

          <div className={styles.timelineList}>
            {flowPlan.timeline_data.map((item, index) => (
              <div key={index} className={styles.timelineItem}>
                <div className={styles.timeBlock}>{item.time}</div>
                <div className={styles.activityBlock}>
                  <h3 className={styles.activityTitle}>{item.activity}</h3>
                  <p className={styles.activityDesc}>{item.description}</p>
                  <span className={styles.activityDuration}>{item.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 4 && (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon} style={{ color: "#10b981" }}>
              <FaCheckCircle />
            </div>
            <h2 style={{ color: "#111827", marginBottom: "12px" }}>Plan Saved Successfully!</h2>
            <div className={styles.emptyStateText}>
              Your ideation, vendor selections, and timeline flow have been explicitly saved to your account.
              You can load this later and convert it into a real live event when you are ready.
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "center" }}>
              <button 
                className={styles.secondaryBtn}
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </button>
              <button 
                className={styles.generateBtn}
                onClick={() => {
                  setStep(1);
                  setFormData({
                    title: "", event_type: "conference", description: "", location: "Lagos",
                    start_date: "", end_date: "", guest_count: "100", budget: "500000",
                  });
                  setVendorPlan(null);
                  setSelectedVendors({});
                  setFlowPlan(null);
                }}
              >
                <FaPlus /> Create Another Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VENDOR QUICK VIEW DRAWER */}
      {viewingVendor && (
        <div className={styles.drawerOverlay} onClick={() => setViewingVendor(null)}>
          <div className={styles.sideDrawer} onClick={(e) => e.stopPropagation()}>
            <button className={styles.drawerCloseBtn} onClick={() => setViewingVendor(null)}><FaTimes size={14} /></button>
            
            {/* Cover Image */}
            <div 
              className={`${styles.drawerCoverImage} ${styles['coverGradient' + ((viewingVendor.category.length + (viewingVendor.vendor.business_name || '').length) % 5)]}`}
              style={viewingVendor.vendor.cover_image_url ? { 
                backgroundImage: `url(${viewingVendor.vendor.cover_image_url})`,
                backgroundSize: '100%' 
              } : undefined}
            />

            <div className={styles.drawerContent}>
              <div className={styles.drawerHeader}>
                <h2 className={styles.drawerTitle}>{viewingVendor.vendor.business_name}</h2>
                <div className={styles.drawerSubtitle}>
                  <span>{viewingVendor.category} Expert</span>
                  <div className={styles.drawerRating}>
                    ★ {Number(viewingVendor.vendor.average_rating || 0).toFixed(1)}
                  </div>
                </div>
              </div>

              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>About</h3>
                <p className={styles.drawerBio}>
                  {viewingVendor.vendor.bio || `A top-rated professional providing spectacular ${viewingVendor.category.toLowerCase()} services for your event. With a passion for excellence, they consistently execute seamlessly against tight budgets and deadlines.`}
                </p>
              </div>

              <div className={styles.drawerSection}>
                <h3 className={styles.drawerSectionTitle}>Contact & Location</h3>
                <div className={styles.drawerContactList}>
                  <div className={styles.contactItem}>
                    <div className={styles.contactIcon}><FaMapMarkerAlt size={16} /></div>
                    <span>{viewingVendor.vendor.location_text || "Remote / Serves Multiple Locations"}</span>
                  </div>
                  <div className={styles.contactItem}>
                     <div className={styles.contactIcon}><FaPhone size={14} /></div>
                     <span>{viewingVendor.vendor.phone_number || "Contact details provided upon booking"}</span>
                  </div>
                </div>
              </div>

              {/* Packages / Service Items */}
              {viewingVendor.vendor.packages && viewingVendor.vendor.packages.length > 0 && (
                <div className={styles.drawerSection}>
                  <h3 className={styles.drawerSectionTitle}>Available Packages</h3>
                  <div className={styles.packageList}>
                    {viewingVendor.vendor.packages.map((pkg: any, idx: number) => {
                      const isChecked = drawerPackages.includes(pkg.name);
                      return (
                        <div
                          key={idx}
                          className={`${styles.packageItem} ${isChecked ? styles.packageItemChecked : ''}`}
                          onClick={() => {
                            setDrawerPackages(prev =>
                              isChecked
                                ? prev.filter(p => p !== pkg.name)
                                : [...prev, pkg.name]
                            );
                          }}
                        >
                          <div className={styles.packageCheck}>
                            {isChecked && <FaCheckCircle style={{ color: '#10b981', fontSize: '1rem' }} />}
                          </div>
                          {pkg.image_url && (
                            <div style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 8, overflow: 'hidden', marginLeft: '4px' }}>
                              <img src={pkg.image_url} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          <div className={styles.packageDetails}>
                            <div className={styles.packageHeader}>
                              <span className={styles.packageName}>{pkg.name}</span>
                              <span className={styles.packagePrice}>₦{Number(pkg.price).toLocaleString()}</span>
                            </div>
                            <p className={styles.packageDesc}>{pkg.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.drawerFooter}>
              {selectedVendors[viewingVendor.category]?.id === viewingVendor.vendor.id ? (
                 <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                   <button 
                     className={`${styles.hireLargeBtn} ${styles.hireSelectBtn}`} 
                     onClick={() => {
                       setSelectedVendors(prev => ({ ...prev, [viewingVendor.category]: { ...viewingVendor.vendor, chosen_packages: drawerPackages } }));
                       setViewingVendor(null);
                     }}
                     style={{ flex: 2 }}
                   >
                     Update Packages
                   </button>
                   <button 
                     className={`${styles.hireLargeBtn} ${styles.hireRemoveBtn}`} 
                     onClick={() => {
                       setSelectedVendors(prev => { const next = {...prev}; delete next[viewingVendor.category]; return next; });
                       setViewingVendor(null);
                     }}
                     style={{ flex: 1, padding: "16px 8px", fontSize: "0.95rem" }}
                   >
                     Remove
                   </button>
                 </div>
              ) : (
                 <button 
                   className={`${styles.hireLargeBtn} ${styles.hireSelectBtn}`} 
                   onClick={() => {
                     setSelectedVendors(prev => ({ ...prev, [viewingVendor.category]: { ...viewingVendor.vendor, chosen_packages: drawerPackages } }));
                     setViewingVendor(null);
                   }}
                 >
                   <FaCheckCircle /> Add to Event Plan
                 </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
