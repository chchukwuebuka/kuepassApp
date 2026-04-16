import re
import os

old_file = r"c:\Users\User\Desktop\kuepassApp\scratch_old.tsx"
target_file = r"c:\Users\User\Desktop\kuepassApp\components\CreateEventPage\index.tsx"

with open(old_file, "r", encoding="utf-16") as f:
    old_content = f.read()

# 1. Extract Event Image Section
image_pattern = re.compile(
    r"(\s*\{\/\* Event Image Section \*\/\}[\s\S]*?(?=\{\/\* Event Details Section \*\/\}|\{\/\* Date and Location Section \*\/\b))"
)
image_match = image_pattern.search(old_content)
image_section = image_match.group(1) if image_match else ""

# 2. Extract Button Text Selector & Event Details Section
button_text_pattern = re.compile(
    r"(\s*\{\/\* Button Text Selector \*\/\}[\s\S]*?onSchedulesChange=\{setSchedules\}\n\s*\/\>\n)"
)
btn_match = button_text_pattern.search(old_content)
details_section = btn_match.group(1) if btn_match else ""

with open(target_file, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the duplicate currentStep === 4
content = content.replace("{currentStep === 4 && (\n          <>\n            <TicketsStep", "{currentStep === 3 && (\n          <>\n            <TicketsStep")

step2_block = f"""
        {{currentStep === 2 && (
          <div className={{styles.section}}>
            {image_section}
            {details_section}

            {{/* Save & Exit / Save & Continue Buttons for Step 2 */}}
            <div className={{styles.saveButtonsContainer}} style={{{{ gap: '15px', marginTop: '30px' }}}}>
              <button
                type="button"
                className={{styles.saveExitButton}}
                onClick={{() => setCurrentStep(1)}}
              >
                Back
              </button>
              <div style={{{{ display: 'flex', gap: '15px' }}}}>
                <button
                  type="button"
                  className={{styles.saveExitButton}}
                  onClick={{() => {{
                    saveDraft();
                    router.push("/dashboard");
                  }}}}
                >
                  Save & Exit
                </button>
                <button
                  type="button"
                  className={{styles.saveContinueButton}}
                  onClick={{() => {{
                    saveDraft();
                    setCurrentStep(3);
                  }}}}
                >
                  Save & Continue
                </button>
              </div>
            </div>
          </div>
        )}}
"""

# Insert step 2 right before step 3
if "{currentStep === 3 && (" in content:
    content = content.replace("{currentStep === 3 && (", step2_block + "\n        {currentStep === 3 && (")
else:
    print("WARNING: Could not find {currentStep === 3 && (")

with open(target_file, "w", encoding="utf-8") as f:
    f.write(content)

print("Restored missing sections to index.tsx!")
