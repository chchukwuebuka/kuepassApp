import re

file_path = r"c:\Users\User\Desktop\kuepassApp\components\CreateEventPage\index.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add showSuccessModal state
if "const [showSuccessModal, setShowSuccessModal] = useState(false);" not in content:
    content = content.replace(
        "const [activeTab, setActiveTab] = useState(\"basic\");",
        "const [activeTab, setActiveTab] = useState(\"basic\");\n  const [showSuccessModal, setShowSuccessModal] = useState(false);"
    )

# 2. Modify handleSubmit
content = content.replace(
    'alert("Event created successfully!");',
    "setShowSuccessModal(true);"
)

# 3. Remove Button Text Selector and Event Details Section from Step 2
content = re.sub(
    r"\s*\{\/\* Button Text Selector \*\/\}[\s\S]*?onSchedulesChange=\{setSchedules\}\n\s*\/\>",
    "",
    content
)

# 4. Remove Save Buttons for Step 2
content = re.sub(
    r"\s*\{\/\* Save & Exit \/ Save & Continue Buttons for Step 2 \*\/\}(.|\n)*?(?=\Z|\n\s*\}\)$|\s*\{\/\* Modal)", 
    "", # wait, need a safe bound
    content
)

# A safer approach for UI rewriting:
# Instead of complex regex, let's just replace the exact large blocks we don't want using the `multi_replace` tool later.
# Let's use Python for the exact TicketsStep extraction.

tickets_step_pattern = re.compile(r"(\{currentStep === (3|4) && \(\s*<>\s*<TicketsStep[\s\S]*?/>\s*</>\s*\)\})")
match = tickets_step_pattern.search(content)

if match:
    tickets_step_code = match.group(1).replace("currentStep === 3", "true").replace("currentStep === 4", "true")
    # Actually just the component itself
    comp_match = re.search(r"(<TicketsStep[\s\S]*?/>)", match.group(1))
    tickets_comp = comp_match.group(1) if comp_match else ""
    
    # Let's completely nuke the old currentStep 3 and 4 blocks
    content = re.sub(r"\{currentStep === 3 && \([\s\S]*?</>\s*\)\}", "", content)
    content = re.sub(r"\{currentStep === 4 && \([\s\S]*?</>\s*\)\}", "", content)
    content = re.sub(r"\{currentStep === 4 && \(\s*<PreviewStep[\s\S]*?/>\s*\)\}", "", content)
    
    # Inject TicketsComp at the end of Step 2
    # Find end of step 2 image section:
    # Look for `<div className={styles.imageGuidelines}>...</div></div></div>`
    
    split_str = """                </p>
                  <p className={styles.guidelineText}>
                    • Supported image files: JPEG, PNG
                  </p>
                </div>
              </div>
            </div>"""
    
    # Fix the encoding characters if needed
    split_str2 = """                </p>\n                  <p className={styles.guidelineText}>\n                    ÔÇó Supported image files: JPEG, PNG\n                  </p>\n                </div>\n              </div>\n            </div>"""
    
    if "Supported image files: JPEG, PNG" in content:
        # We find the insertion point
        parts = re.split(r"(Supported image files: JPEG, PNG\s*</p>\s*</div>\s*</div>\s*</div>)", content)
        if len(parts) > 1:
            # We will insert TicketsComp here! AND remove everything after it until `)}`
            # Actually, let's just replace the End of step 2 save buttons.
            pass

# Let's write the updated content
with open("c:\\Users\\User\\Desktop\\kuepassApp\\scratch_refactor.py", "w") as f:
    f.write("print('ready')")
