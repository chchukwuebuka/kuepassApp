import re

file_path = r"c:\Users\User\Desktop\kuepassApp\components\CreateEventPage\index.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add showSuccessModal state
if "const [showSuccessModal, setShowSuccessModal] = useState(false);" not in content:
    content = content.replace(
        "const [activeTab, setActiveTab] = useState(\"basic\");",
        "const [activeTab, setActiveTab] = useState(\"basic\");\n  const [showSuccessModal, setShowSuccessModal] = useState(false);\n  const [finalEventId, setFinalEventId] = useState(\"\");"
    )

# 2. Modify handleSubmit
# Replace `alert("Event created successfully!");` with modal activation
content = content.replace(
    'alert("Event created successfully!");',
    'setFinalEventId(finalEventId);\n        setShowSuccessModal(true);'
)

# Replace `alert("Event updated successfully!");` with something similar (or just leave it)

# 3. Extract TicketsStep component block precisely
tickets_step_pattern = re.compile(r"(<TicketsStep[\s\S]*?/>)")
match = tickets_step_pattern.search(content)

if match:
    tickets_comp = match.group(1)
    
    # Change currentStep(4) to handleSubmit()
    tickets_comp = re.sub(r"onNext=\{[^}]+\}", "onNext={() => handleSubmit()}", tickets_comp)
    
    # Also adjust it if they click preview? We don't have preview anymore. We renamed the button.

    # 4. Strip out EVERYTHING from "Button Text Selector" to "Save Buttons for step 2" inclusive
    # We look for where `</p>\n                  <p className={styles.guidelineText}>\n                    ÔÇó Supported image files: JPEG, PNG\n                  </p>\n                </div>\n              </div>\n            </div>` ends
    # and replace that chunk down to the end of step 2 `)}`
    
    # First, let's just wipe out ButtonTextSelector and EventDetailsSection explicitly
    content = re.sub(r"\{\/\* Button Text Selector \*\/\}[\s\S]*?onSchedulesChange=\{setSchedules\}\n\s*\/\>", "", content)
    
    # Second, wipe out the Save buttons for Step 2
    content = re.sub(r"\{\/\* Save & Exit \/ Save & Continue Buttons for Step 2 \*\/\}[\s\S]*?Save & Continue\n\s*</button>\n\s*</div>\n\s*</div>", "", content)
    
    # Now inject TicketsComp at the very end of currentStep === 2
    # The end of currentStep === 2 looks like:
    #             </div>
    #           </div>
    #         )}
    
    end_of_image_guidelines = re.compile(r"(Supported image files: JPEG, PNG[\s\S]*?</div>\s*</div>\s*</div>)")
    
    # Inject it right after the image guidelines closures
    def replacer(m):
        return m.group(1) + "\n\n" + tickets_comp + "\n"
    content = end_of_image_guidelines.sub(replacer, content)

    # 5. Remove the OLD currentStep === 3 and currentStep === 4 blocks!
    content = re.sub(r"\{currentStep === (3|4) && \([\s\S]*?</>\s*\)\}", "", content)
    content = re.sub(r"\{currentStep === (3|4) && \(\s*<PreviewStep[\s\S]*?/>\s*\)\}", "", content)

# 6. Add Celebration Modal at the bottom, just before {/* Ticket Modal */}
celebration_modal = """
      {/* Celebration Modal */}
      {showSuccessModal && (
        <div className={styles.modalOverlay} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.modalContent} style={{ maxWidth: '400px', padding: '40px 30px', textAlign: 'center', margin: 'auto', background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: '#1a1a1a' }}>Event Created!</h2>
            <p style={{ margin: '15px 0 25px', color: '#666', lineHeight: '1.5', fontSize: '15px' }}>
              Your event is officially live. Keep the momentum going by heading over to Customization to set up your schedule, custom links, tags, and more!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                type="button" 
                className={styles.saveContinueButton} 
                onClick={() => {
                  router.push(`/dashboard?eventId=${finalEventId}&page=customization`);
                }}
                style={{ background: '#9333ea', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, fontSize: '15px' }}
              >
                Customize & Finalize Event
              </button>
              <button 
                type="button" 
                className={styles.saveExitButton} 
                onClick={() => {
                  router.push(`/dashboard?eventId=${finalEventId}`);
                }}
                style={{ padding: '12px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', border: '1px solid #ddd', background: 'transparent', color: '#444' }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
"""

content = content.replace("{/* Ticket Modal */}", celebration_modal + "\n      {/* Ticket Modal */}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Refactor script complete.")
