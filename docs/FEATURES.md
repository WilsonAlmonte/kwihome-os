# Kwihome - Feature Flows

## Overview

Kwihome is a self-hosted home management application designed for household use on mobile and tablet devices. Each deployment hosts a single household with multiple users sharing all data.

---

## Feature 1: Home Area (room)s (Rooms)

### Purpose

Organize household items, tasks, and notes by physical spaces in the home.

### Flows

#### Creating a Home Area (room)

1. User navigates to Areas section
2. Clicks "Add Area" button
3. Enters area name (e.g., "Kitchen", "Garage", "Master Bedroom")
4. Saves the area
5. Area appears in the areas list
6. Area is now available as an optional category for all other items

#### Editing a Home Area (room)

1. User views areas list
2. Selects an area to edit
3. Updates the name
4. Saves changes
5. All items linked to this area reflect the updated name

#### Deleting a Home Area (room)

1. User selects an area to delete
2. Confirms deletion
3. Area is soft-deleted (marked with `deletedAt`)
4. All items linked to this area have their `areaId` set to null (unlinked)
5. Area no longer appears in selection lists

#### Viewing Items by Area

1. User can filter any list (inventory, tasks, notes) by area
2. Selecting an area shows only items linked to that area
3. Unlinked items appear when "No Room" or "All" filter is selected

---

## Feature 2: Inventory Management

### Purpose

Maintain a master list of regularly purchased household items and track their stock status.

### Flows

#### Adding an Item to Inventory

1. User navigates to Inventory section
2. Clicks "Add Item" button
3. Enters item name (e.g., "Milk", "Paper Towels")
4. Optionally selects a home area (room)
5. Sets initial stock status (IN_STOCK or OUT_OF_STOCK)
6. Saves the item
7. Item appears in inventory list

#### Updating Stock Status

1. User views inventory list
2. Taps an item to toggle its status (quick action)
   - IN_STOCK → OUT_OF_STOCK
   - OUT_OF_STOCK → IN_STOCK
3. Status updates immediately
4. If changed to OUT_OF_STOCK, item automatically appears in next shopping list draft

#### Editing Inventory Item

1. User long-presses or swipes item to access edit
2. Can change: name, area, stock status
3. Saves changes
4. Updates reflected immediately
5. If linked to shopping list items, those items show updated name

#### Deleting Inventory Item

1. User swipes or selects delete action
2. Confirms deletion
3. Item is soft-deleted (marked with `deletedAt`)
4. Linked shopping list items remain but `inventoryItemId` becomes null (one-time items)
5. Item no longer appears in inventory list

#### Viewing Inventory

**Filter Options:**

- All items
- In Stock only
- Out of Stock only
- By specific area
- Unassigned (no room)

**Display:**

- Each item shows: name, status badge (color-coded), area tag (if assigned)
- Count summary: "5 items out of stock"

---

## Feature 3: Shopping Lists

### Purpose

Create and manage shopping trips, with seamless integration to inventory tracking.

### Main Flows

#### Landing on Shopping List Page

**Scenario A: No Active List**

1. User navigates to Shopping Lists
2. System checks for uncompleted shopping lists
3. If none exist, shows dynamic draft view:
   - Automatically displays all OUT_OF_STOCK inventory items
   - List is NOT saved to database yet
   - User can browse and plan without committing

**Scenario B: Uncompleted List Exists**

1. User navigates to Shopping Lists
2. System loads the last uncompleted list (DRAFT or ACTIVE status)
3. Shows existing items in planning mode
4. User can continue editing

#### Creating/Editing a Shopping List (Planning Mode)

**Adding Items:**

_From Inventory (Automatic):_

1. OUT_OF_STOCK inventory items appear automatically in draft
2. Each item shows inventory link indicator
3. Items include area tag if inventory item has one

_Manual One-Time Item:_

1. User clicks "Add Item" button
2. Enters item name
3. Optionally selects area
4. Toggle: "Add to inventory for future tracking"
   - If enabled: creates new inventory item (status: OUT_OF_STOCK)
   - If disabled: creates standalone shopping item
5. Saves item
6. If this is first manual action, draft shopping list is created in database

**Removing Items:**

1. User swipes item left or clicks delete
2. Item removed from shopping list
3. Inventory item (if linked) remains unchanged
4. Item can be re-added later since inventory still shows OUT_OF_STOCK

**Editing Items:**

1. User taps item to edit
2. Can change: name, area
3. Can toggle: "Track in inventory"
   - Enabling creates inventory link
   - Disabling removes inventory link (becomes one-time item)
4. Saves changes

**List State:**

- Draft remains in DRAFT status during planning
- Can abandon draft (soft delete) to start fresh
- System auto-saves changes

#### Starting a Shopping Trip (Active Mode)

1. User reviews shopping list in planning mode
2. Clicks "START SHOPPING" button
3. Shopping list status changes: DRAFT → ACTIVE
4. `startedAt` timestamp recorded
5. UI switches to Shopping Mode:
   - Simplified, larger touch targets
   - Focus on checking items off
   - Progress counter visible (e.g., "5 of 12 items")
   - Minimal distractions

**In Shopping Mode:**

1. User picks items at store
2. Taps checkbox to mark item as checked
3. Progress counter updates
4. Can uncheck if needed
5. Can still add/remove items (with simplified UI)

#### Completing a Shopping Trip

1. User clicks "I'M DONE!" button
2. System processes completion:
   - Shopping list status: ACTIVE → COMPLETED
   - `completedAt` timestamp recorded
   - For each checked item linked to inventory:
     - Updates inventory item status to IN_STOCK
   - For unchecked items: no action (still needed)
3. Shopping list is archived (soft delete or completed state)
4. User returns to shopping list landing page
5. Next visit shows fresh draft with current OUT_OF_STOCK items

#### Managing Multiple Shopping Lists

**Viewing Past Lists:**

1. User can access "History" or "Completed" section
2. Shows archived/completed shopping lists with dates
3. Can view items from past trips (read-only)
4. Useful for reference or recurring patterns

**Abandoning a Draft:**

1. User can delete/abandon current draft
2. Confirms action
3. Draft is soft-deleted
4. Next visit generates fresh draft from inventory

### Edge Cases

**Item Deleted from Inventory While in Shopping List:**

- Shopping list item remains (becomes standalone one-time item)
- Inventory link is removed
- User can still complete shopping with this item

**Multiple Users Editing Same List:**

- Changes sync in real-time (if implemented)
- Last update wins (optimistic updates)

**All Items Checked but Not Done:**

- User can uncheck items
- "I'M DONE!" remains available regardless of check status
- Unchecked items won't update inventory

---

## Feature 4: Tasks

### Purpose

Simple household task management with optional area organization.

### Flows

#### Creating a Task

1. User navigates to Tasks section
2. Clicks "Add Task" button
3. Enters task title (required)
4. Optionally enters description
5. Optionally selects area
6. Saves task
7. Task appears in active tasks list

#### Completing a Task

1. User views tasks list
2. Taps checkbox next to task
3. Task marked as completed
4. Task moves to "Completed" section (collapsed by default)
5. `completed` boolean set to true

#### Uncompleting a Task

1. User expands "Completed" section
2. Taps checkbox next to completed task
3. Task marked as incomplete
4. Task moves back to active tasks list
5. `completed` boolean set to false

#### Editing a Task

1. User taps task to view details
2. Clicks edit button
3. Can modify: title, description, area
4. Saves changes
5. Updates reflected immediately

#### Deleting a Task

1. User swipes task or selects delete action
2. Confirms deletion
3. Task is soft-deleted (marked with `deletedAt`)
4. Task no longer appears in lists

#### Viewing Tasks

**Filter Options:**

- All tasks (active + completed)
- Active only (default)
- Completed only
- By specific area
- Unassigned (no room)

**Display:**

- Active tasks at top
- Completed tasks in collapsed section below
- Each task shows: checkbox, title, area tag (if assigned)
- Count summary: "8 active tasks"

### Future Enhancements

- Due dates
- Priority levels
- Assign to specific users
- Recurring tasks

---

## Feature 5: Notes

### Purpose

Store household information, recipes, instructions, and general notes with rich text formatting.

### Flows

#### Creating a Note

1. User navigates to Notes section
2. Clicks "Add Note" button
3. Enters note title
4. Uses rich text editor for content:
   - Bold, italic, underline
   - Headers (H1, H2, H3)
   - Lists (bullet, numbered)
   - Links
5. Optionally selects area
6. Saves note
7. Note appears in notes list with preview

#### Viewing a Note

1. User taps note card from list
2. Note opens in full view
3. Shows formatted content
4. Can scroll through long notes
5. Can tap edit button to modify

#### Editing a Note

1. User opens note
2. Clicks edit button
3. Title and content become editable
4. Can change area assignment
5. Saves changes
6. Updated note reflects changes immediately

#### Deleting a Note

1. User long-presses or swipes note card
2. Selects delete action
3. Confirms deletion
4. Note is soft-deleted (marked with `deletedAt`)
5. Note no longer appears in list

#### Viewing Notes

**Display Options:**

- Grid view (default for tablets): cards with title preview
- List view (default for phones): compact list
- Each note shows: title, area tag (if assigned), timestamp

**Filter Options:**

- All notes
- By specific area
- Unassigned (no room)
- Recent (sorted by update date)

**Search:**

- Search notes by title and content
- Real-time filtering as user types

### Future Enhancements

- Attachments (images, PDFs)
- Note sharing outside household
- Templates for common note types
- Pinning important notes

---

## Cross-Feature Interactions

### Area Assignment Flow (Universal)

**For any item type (inventory, shopping item, task, note):**

1. During creation: optional area dropdown
2. Can be left unassigned
3. After creation: can add/change area via edit
4. Can remove area assignment (set to null)
5. When area is deleted: items become unassigned
6. Filtering by area works consistently across all features

### User Experience Principles

1. **Mobile-First**: All interactions optimized for touch
2. **Minimal Friction**: Smart defaults, optional categorization
3. **Progressive Enhancement**: Start simple, add complexity as needed
4. **Flexible Workflows**: Support multiple usage patterns
5. **Real-Time Updates**: Changes reflected immediately
6. **Forgiving UX**: Easy to undo, modify, or delete
7. **Household Sharing**: All users see same data
8. **Offline Capable** (Future): Work offline, sync when connected

---

## Data Relationships Summary

```
HomeArea
├── InventoryItem (many)
├── ShoppingListItem (many)
├── Task (many)
└── Note (many)

InventoryItem
├── ShoppingListItem (many) - linked items
└── HomeArea (optional one)

ShoppingList
└── ShoppingListItem (many)

ShoppingListItem
├── ShoppingList (one) - parent list
├── InventoryItem (optional one) - linked inventory
└── HomeArea (optional one)

Task
└── HomeArea (optional one)

Note
└── HomeArea (optional one)
```

---

## Future Considerations

### Phase 2 Features

- User-specific task assignments
- Due dates and reminders
- Recurring tasks and shopping items
- Note attachments
- Shared vs private notes
- Shopping list templates
- Barcode scanning for inventory
- Receipt capture
- Budget tracking per shopping trip

### Phase 3 Features

- Multi-household support for same user
- Calendar integration
- Meal planning
- Recipe management linked to shopping
- Home maintenance schedules
- Bill tracking
- Guest/temporary user access
