import re

filepath = r"c:\Users\User\Desktop\kuepassApp\components\Customization\index.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
if "import EventDetailsSection" not in content:
    content = content.replace(
        "import AppearanceStep from \"../AppearanceStep\";",
        "import AppearanceStep from \"../AppearanceStep\";\nimport EventDetailsSection from \"../CreateEventPage/EventDetailsSection\";\nimport ButtonTextSelector from \"../CreateEventPage/ButtonTextSelector\";\nimport { Settings } from \"lucide-react\";"
    )

# 2. In fetchCustomization(), map the new fields
# find `price: event.price?.toString() || "0.00",`
# and insert the new fields below it inside the `fd` definition.
new_fields = """        price: event.price?.toString() || "0.00",
        tags: event.tags || [],
        socialLinks: event.social_links
            ? {
                instagram: event.social_links.find((l: any) => l.platform === "instagram")?.url,
                youtube: event.social_links.find((l: any) => l.platform === "youtube")?.url,
                tiktok: event.social_links.find((l: any) => l.platform === "tiktok")?.url,
              }
            : {},
        sections: event.sections || [],
        lineupItems: event.line_up || [],
        schedules: event.itinerary || [],
        ticketButtonText: existing?.button_text || "Get Ticket","""

content = content.replace(
    'price: event.price?.toString() || "0.00",',
    new_fields
)

# 3. Add to eventPayload in handleSubmit()
payload_injection = """
      const socialLinksArray: { platform: string; url: string }[] = [];
      if (formData.socialLinks?.instagram) socialLinksArray.push({ platform: "instagram", url: formData.socialLinks.instagram });
      if (formData.socialLinks?.youtube) socialLinksArray.push({ platform: "youtube", url: formData.socialLinks.youtube });
      if (formData.socialLinks?.tiktok) socialLinksArray.push({ platform: "tiktok", url: formData.socialLinks.tiktok });

      const lineUpArray = (formData.lineupItems || []).map((item: any) => ({
        name: item.name,
        role: item.role,
        description: item.description,
        ...(item.image && { image: item.image }),
      }));

      const itineraryArray = (formData.schedules || []).flatMap((schedule: any) =>
        schedule.slots.map((slot: any) => ({
          title: schedule.name || slot.title,
          activity: slot.title,
          start_time: slot.startTime,
          end_time: slot.endTime,
          host: slot.hostName || "",
          description: slot.description || "",
        }))
      );

      const eventPayload: any = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        start_date: `${formData.startDate}T${formData.startTime}:00Z`,
        end_date: `${formData.endDate}T${formData.endTime}:00Z`,
        price: parseFloat(formData.price),
        card_color: formData.cardColor,
        ...(formData.tags && formData.tags.length > 0 && { tags: formData.tags }),
        ...(socialLinksArray.length > 0 && { social_links: socialLinksArray }),
        ...(lineUpArray.length > 0 && { line_up: lineUpArray }),
        ...(itineraryArray.length > 0 && { itinerary: itineraryArray }),
      };
"""

content = re.sub(
    r"const eventPayload = \{[\s\S]*?card_color: formData.cardColor,\n\s*\};",
    payload_injection.strip(),
    content
)

# 4. Add ticketButtonText to customizationPayload
content = content.replace(
    "card_color: formData.cardColor,\n        is_active: true,",
    "card_color: formData.cardColor,\n        button_text: formData.ticketButtonText !== 'Get Ticket' ? formData.ticketButtonText : undefined,\n        is_active: true,"
)

# 5. Add Advanced Tab to JSX
if 'value="advanced"' not in content:
    content = content.replace(
        '<Tabs.Tab value="preview" icon={<Eye />}>',
        '<Tabs.Tab value="preview" icon={<Eye />}>\n                    Preview\n                  </Tabs.Tab>\n                  <Tabs.Tab value="advanced" icon={<Settings />}>\n                    Advanced & Marketing\n                  </Tabs.Tab>\n                  {/* Temp comment to block replace duplicate */}'
    )
    # the replace above might mess up the existing `<Tabs.Tab value="preview"` block so let's be careful.
    pass

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("done")
