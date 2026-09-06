<template>
  <div class="wrapper">
    <!-- Loading Screen -->
    <div class="loading" v-if="Remove_Loading_Screen" :class="{ active: !Loading }">

      <!-- 1. Brand Identity (Top) -->
      <div class="loading_brand_container">
        <p class="loading_brand_name">
          Nexora
        </p>
        <span class="loading_brand_tagline">
          Intelligent Workspace
        </span>
      </div>

      <div class="loader">
        <div class="circle"></div>

        <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">

          <!-- Yellow Background -->
          <rect x="0" y="0" width="256" height="256" rx="48" fill="#F4C430" />

          <!-- Larger White Note -->
          <rect x="48" y="40" width="160" height="176" rx="22" fill="#F4F1E8" />

          <!-- Left Binding Tabs -->
          <rect x="40" y="70" width="14" height="12" rx="4" fill="#E2A800" />
          <rect x="40" y="104" width="14" height="12" rx="4" fill="#E2A800" />
          <rect x="40" y="138" width="14" height="12" rx="4" fill="#E2A800" />
          <rect x="40" y="172" width="14" height="12" rx="4" fill="#E2A800" />

          <!-- Text Lines -->
          <rect x="84" y="80" width="88" height="10" rx="5" fill="#CFCFCF" />
          <rect x="84" y="108" width="88" height="10" rx="5" fill="#CFCFCF" />
          <rect x="84" y="136" width="88" height="10" rx="5" fill="#CFCFCF" />
          <rect x="84" y="164" width="68" height="10" rx="5" fill="#CFCFCF" />

        </svg>

      </div>
      <h1 class="loading-text">Loading Notes<span class="dots"></span></h1>
    </div>



    <div>

      <!-- Sidebar -->
      <div class="nav_bar">
        <aside id="nxSidebar" class="nx-sidebar" :class="{ show: sidebarOpen }">

          <!-- Logo -->
          <div class="nx-logo">
            <div class="nx-logo-box">

              <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">

                <!-- Yellow Background -->
                <rect x="0" y="0" width="256" height="256" rx="48" fill="#F4C430" />

                <!-- Larger White Note -->
                <rect x="48" y="40" width="160" height="176" rx="22" fill="#F4F1E8" />

                <!-- Left Binding Tabs -->
                <rect x="40" y="70" width="14" height="12" rx="4" fill="#E2A800" />
                <rect x="40" y="104" width="14" height="12" rx="4" fill="#E2A800" />
                <rect x="40" y="138" width="14" height="12" rx="4" fill="#E2A800" />
                <rect x="40" y="172" width="14" height="12" rx="4" fill="#E2A800" />

                <!-- Text Lines -->
                <rect x="84" y="80" width="88" height="10" rx="5" fill="#CFCFCF" />
                <rect x="84" y="108" width="88" height="10" rx="5" fill="#CFCFCF" />
                <rect x="84" y="136" width="88" height="10" rx="5" fill="#CFCFCF" />
                <rect x="84" y="164" width="68" height="10" rx="5" fill="#CFCFCF" />

              </svg>

            </div>
            <h1 class="nx-logo-text">Nexora</h1>

            <!-- Close Button -->
            <button class="nx-close-btn" @click="closeSidebar">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>

          </div>

          <!-- Menu Section -->
          <div class="nx-section-title" style="color: #e3b246">Notes Category</div>
          <div class="nx-menu">
            <div class="nx-menu-item" :class="{ Selected_item: activeItem === 1 }"
              @click="activeItem = 1; setFilter('all')">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M3 3h18v6H3V3zm0 8h18v10H3V11z" />
              </svg>
              All Notes
            </div>
            <div class="nx-menu-item" :class="{ Selected_item: activeItem === 2 }"
              @click="activeItem = 2; setFilter('favorites')">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 17.3l6.2 3.7-1.6-7L22 9.3l-7.2-.6L12 2 9.2 8.7 2 9.3l5.4 4.7-1.6 7z" />
              </svg>
              Favorite Notes
            </div>
          </div>

          <!-- Workspaces Section -->
          <div class="nx-section-title">
            <span>WORKSPACES</span>
            <button class="add-ws-btn" @click="openNewModal">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </button>
          </div>

          <!-- Workspace List (Reactive + Fluid) -->
          <div class="nx-workspace-list">
            <template v-for="(ws, index) in workspaces" :key="ws.id">
              <!-- Workspace Row -->
              <div class="workspace_item" :class="{ Selected_item: activeItem === index + 'ws' }"
                @click.stop="activeItem = index + 'ws'; setFilter('workspace', ws.id)">
                <div class="nx-workspace-row" :class="{ expanded: expandedStates[ws.id] }" @click="handleRowClick(ws)">
                  <div class="nx-workspace-main">
                    <div class="nx-dot" :style="{ background: ws.color }"></div>
                    <span class="nx-workspace-name">{{ ws.name }}</span>
                  </div>

                  <!-- Expand Arrow (only if subgroups exist) -->
                  <span v-if="ws.subgroups?.length > 0" class="expand-arrow" @click.stop="toggleExpanded(ws.id)">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>

                  <!-- Actions / Confirmation -->
                  <div class="ws-actions">
                    <template v-if="confirmingId === ws.id">
                      <!-- Two-step delete confirmation (exact original behaviour) -->
                      <div class="confirm-actions">
                        <button class="confirm-btn cancel" title="Cancel" @click.stop="cancelConfirm">
                          ✕
                        </button>
                        <button class="confirm-btn confirm" title="Delete" @click.stop="confirmDelete">
                          ✓
                        </button>
                      </div>
                    </template>
                    <template v-else>
                      <button class="ws-action-btn edit-ws" title="Edit" @click.stop="openEditModal(ws)">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path
                            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                      <button class="ws-action-btn delete-ws" title="Delete" @click.stop="startDelete(ws.id)">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </template>
                  </div>
                </div>

                <!-- Nested Subgroups (smooth expand/collapse via CSS + Vue reactivity) -->
                <div v-if="ws.subgroups?.length > 0" class="subgroup-nested" :class="{ show: expandedStates[ws.id] }">
                  <div v-for="(sub, Sub_idx) in ws.subgroups" :key="Sub_idx"
                    :class="{ Selected_item: activeItem === Sub_idx + 'sg' }"
                    @click.stop="activeItem = Sub_idx + 'sg'; setFilter('subgroup', ws.id, sub.name)"
                    class="subgroup-item-nested">
                    {{ sub.name?.length > 20 ? sub.name.substring(0, 20) + '...' : sub.name }}
                  </div>
                </div>
              </div>



            </template>
          </div>

          <!-- Storage Section (static as original) -->
          <div class="nx-storage">
            <div class="nx-capacity">
              <div class="nx-progress-ring">
                <svg viewBox="0 0 48 48" width="60" height="60">
                  <circle class="nx-progress-bg" cx="24" cy="24" r="22"></circle>
                  <circle class="nx-progress-bar" cx="24" cy="24" r="22" :stroke-dasharray="circumference"
                    :stroke-dashoffset="dashOffset"></circle>
                </svg>
                <div class="nx-progress-icon">
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path d="M4 6h16v4H4V6zm0 6h16v6H4v-6z" />
                  </svg>
                </div>
              </div>
              <div class="nx-capacity-text">
                <div class="nx-capacity-label">CAPACITY</div>
                <div class="storage_cap_text">{{ Used_Storage_Capacity }}G / {{ Total_Storage_Capacity }}G</div>
              </div>
            </div>


          </div>
        </aside>
        <!-- Modal Overlay to close it -->
        <div class="nav_bar_overlay" :class="{ show: sidebarOpen }" @click="closeSidebar"></div>
      </div>


      <!-- Modal (with preserved scale + fade animation) -->
      <div class="modal-overlay" :class="{ show: showModal }" @click.self="closeModal">
        <div class="modal-card">
          <h2>{{ modalTitle }}</h2>

          <!-- Workspace Name -->
          <div class="field">
            <input :class="{ workspace_input_empty_error: workspace_input_toggle.name }" v-model="wsName" type="text"
              placeholder="Name"
              @keyup.enter="$event.target.closest('.modal-card').querySelectorAll('input')[1]?.focus()" />
          </div>

          <!-- Color Palette -->
          <div class="field">
            <label>IDENTITY COLOR</label>
            <div class="color-row">
              <div v-for="c in colorOptions" :key="c.code" class="color-swatch" :style="{ backgroundColor: c.code }"
                :class="{ selected: selectedColor === c.code }" @click="selectedColor = c.code"></div>
            </div>
            <div class="selected-indicator">
              Selected: {{ selectedColorName }}
            </div>
          </div>

          <!-- Sub-groups -->
          <div class="add-subgroup-row">
            <input :class="{ workspace_input_empty_error: workspace_input_toggle.SubGroup }" v-model="newSubgroup"
              type="text" placeholder="Sub-Group Name (Optional)" @keyup.enter="addTempSubgroup" />
            <button class="add-btn" @click="addTempSubgroup">
              Add
            </button>
          </div>

          <!-- Subgroup List (reactive) -->
          <div class="subgroup-scroll-container">
            <div v-if="!tempSubgroups.length" style="color: #7e91a8; padding: 8px; font-style: italic">
              No sub-groups
            </div>
            <div v-else v-for="(sg_obj, idx) in tempSubgroups" :key="idx">
              <div v-if="Delete_Select != idx && !sg_obj.soft_deletion" class="subgroup-item">
                <span class="subgroup-name">{{ sg_obj.name }}</span>
                <button class="remove-subgroup" @click="removeSubgroup(idx)">
                  ×
                </button>
              </div>

              <div class="subgroup-item sub_group_deletion_container"
                v-if="Delete_Select === idx && !sg_obj.soft_deletion">
                <button class="sbo" @click="remove_only_Subgroup('soft')">
                  <strong>This Group</strong>
                </button>

                <button v-if="Editing_Workspace" class="sbn" @click="remove_only_Subgroup('hard')">
                  <strong>Group + Notes</strong>
                </button>

                <button class="sb_cancel" @click="Cancel_Delete_Subgroup">
                  Cancel
                </button>
              </div>

              <div v-if="sg_obj.soft_deletion" :class="{ subgroup_item_hard_deletion: sg_obj.hard_deletion }"
                class="subgroup-item">
                <span class="removing_striked_subgroup subgroup-name">{{ sg_obj.name }}</span>
              </div>

            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-row">
            <button class="btn-secondary" @click="closeModal">
              Cancel
            </button>
            <button class="btn-primary" @click="saveWorkspace">
              {{ editingWorkspaceId ? 'Save Changes' : 'Create Workspace' }}
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- Workspace Deletion Confirmation Modal -->

    <div id="demo-modal" class="modal-overlay" :class="{ show: Toggle_WorkSpace_Delete_Confirmation }"
      @click.self="Cancel_WorkSpace_Deletion">
      <div class="modal" :class="{ show: Toggle_WorkSpace_Delete_Confirmation }">

        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title">Delete Workspace</div>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <div class="warning-text">
            Delete <strong>"WS"</strong>?
          </div>

          <div class="info-box">
            <div class="info-item">
              <span class="info-label">Subgroups</span>
              <span class="info-value">{{ Total_Sub_Groups_To_Be_Deleted }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Linked Notes</span>
              <span class="info-value">{{ Total_Linked_Notes_To_Be_Deleted }}</span>
            </div>
          </div>

          <p style="font-size: 14px; color: #aaa; line-height: 1.4;">
            This action cannot be undone. All notes and subgroups inside this workspace will be affected.
          </p>
        </div>

        <!-- Footer Buttons -->
        <div class="modal-footer">
          <button class="ws-btn ws-btn-cancel" @click="Cancel_WorkSpace_Deletion">Cancel</button>
          <button class="ws-btn ws-btn-workspace" @click="Delete_WorkSpace_And_Associated_Notes('soft')">This
            Workspace</button>
          <button class="ws-btn ws-btn-destructive" @click="Delete_WorkSpace_And_Associated_Notes('hard')">Workspace +
            Notes</button>
        </div>

      </div>
    </div>




    <!-- Header -->
    <div class="Top_Container" :style="isAddBtnPressed || IsRoViewNoteOpen ? { borderBottom: '2px solid #e3b23c30' } : {}
      ">
      <div class="searchbar" :class="{ active: Blur_Background_WhileOpening_Note }">
        <!-- Open Sidebar Button -->
        <button id="nxOpenBtn" class="nx-open-btn" @click="openSidebar" title="Open Menu Panel">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
          </svg>
        </button>

        <div class="search-container">
          <input name="Search_Bar" type="text" placeholder="Search notes..." class="searchinput showinput"
            ref="SearchInput_Element" v-model.trim="inputData" @input="Making_Debounce" @keydown.enter.prevent />
          <svg viewBox="0 0 24 24">
            <path
              d="M21.71 20.29l-3.388-3.388a8.063 8.063 0 10-1.414 1.414l3.388 3.388a1 1 0 001.414-1.414zM10 16a6 6 0 110-12 6 6 0 010 12z" />
          </svg>
        </div>
        <button class="btn addbtn" @click="Create_Edit_Note_By_WorkSpace(null, false)" title="Add Note"
          :disabled="deleteTimeouts.size">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" fill="none" />
            <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" />
            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" />
          </svg>
        </button>
      </div>
    </div>

    <!-- No notes when we do search or filter and we have notes in array -->
    <div class="empty_card_container" v-if="data.length > 0" :class="{ show: Is_No_Notes_Found_Message }">
      <p class="empty_card_container_message">No Notes Found</p>
    </div>

    <!-- when we don't have any notes in array -->
    <div class="empty_card_container show" v-if="data.length <= 0">
      <p class="empty_card_container_message">No Notes Available</p>
    </div>

    <draggable @change="onDraggableChange" v-model="visibleNotes" item-key="id" class="card_con"
      :disabled="deleteTimeouts.size"
      :class="[{ active: Blur_Background_WhileOpening_Note }, { Screen_load_animation_end: Loading_screen_end_then_animate_notes_card_con }]">
      <!-- Cards --> <template #item="{ element, index }">
        <div class="card_wrapper" :ref="el => { if (el) Card.push(el) }" :key="element.id || index"
          :data-id="element.id">
          <div :style="{ 'background-color': element.Card_Para_Color }" class="cards" :key="element.id + sort_order"
            :class="[{ smoothhide: element.isCardGoingDeleted }, { disable_Card_While_Saving: element.IsLoading }]"
            :data-id="index">
            <div class="Title_Con">
              <p class="Card_Title"> {{ getShortText((element.title != null && element.title != undefined) ?
                element.title.length > 18 ? element.title.substring(0, 18) : element.title ?? "" : "", true) }} </p>
            </div>
            <div class="Para_Con" @click="RO_ViewNotePage(element.id)">
              <p class="Card_Para" ref="Each_Note_Preview" v-html="getShortText(element.userWroteHtml, false)"></p>
            </div>
            <div class="Upload_Loader Upload_Loader_active" v-show="element.IsLoading"></div>

            <div class="extra">

              <div class="card_footer">
                <h4>{{ element.NotesDate }}</h4>

                <button class="fav-btn" @click="toggleFavorite(element)" title="Toggle Favorite">

                  <!-- Filled star when active -->
                  <svg v-if="element.isFav" viewBox="0 0 24 24" width="24" height="24" fill="gold">
                    <path d="M12 17.27L18.18 21l-1.64-7.03
               L22 9.24l-7.19-.61L12 2
               9.19 8.63 2 9.24l5.46 4.73
               L5.82 21z" />
                  </svg>

                  <!-- Outlined star when inactive -->
                  <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="black">
                    <path d="M12 17.27L18.18 21l-1.64-7.03
               L22 9.24l-7.19-.61L12 2
               9.19 8.63 2 9.24l5.46 4.73
               L5.82 21z" />
                  </svg>

                </button>


                <div class="notes_card_footer_menu_btns_container">
                  <button @click="toggleNoteFooterMenu(element.id)" class="toggle_footer_btns_menu">
                    <text>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                      </svg>
                    </text>
                  </button>


                  <div v-if="toggle_note_fotter_menu === element.id" class="notes_card_footer_btn_container"
                    :class="{ show: show_note_footer_menu }">
                    <button class="edit notes_footer_menu_btn" @click="Create_Edit_Note_By_WorkSpace(element.id, true)"
                      title="Edit Note" :disabled="deleteTimeouts.size">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />

                      </svg>
                      <span>Edit</span>
                    </button>

                    <button class="delete notes_footer_menu_btn" @click="DeleteCard($event, index)" title="Delete Note">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>

                </div>

              </div>


            </div>
          </div>
          <div :class="{ smoothhide: !element.isCardGoingDeleted }" class="note undo-card" style="--undo-duration: 5s">
            <div class="undo-content"> <span class="undo-icon">🗑️</span> <span class="undo-text">Note deleted</span>
              <div class="undo-progress">
                <div class="undo-progress-bar"></div>
              </div> <button @click="Handle_Undo($event)" class="undo-btn">UNDO</button>
            </div>
          </div>
        </div>
      </template>
    </draggable>

    <!-- Empty message when no cards -->
    <div class="empty_card_container" v-if="data.length == 0">
      <p class="empty_card_container_message">No Notes Available</p>
    </div>




    <!-- WORKSPACE SELECTOR MODAL (lightweight & beautiful) -->
    <div class="modal-overlay" :class="{ show: showWorkspaceSelector }" @click.self="cancelWorkspaceSelection">
      <div ref="workspaceSelectorCard" tabindex="0" @keydown.up.prevent="moveWorkspaceSelection(-1)"
        @keydown.down.prevent="moveWorkspaceSelection(1)" @keydown.left.prevent="moveSubgroupSelection(-1)"
        @keydown.right.prevent="moveSubgroupSelection(1)" @keydown.enter.prevent="confirmWorkspaceSelection"
        @keydown.esc.prevent="cancelWorkspaceSelection" class="workspace-selector-card"
        :class="{ show: showWorkspaceSelector }">
        <h2 class="selector-title">Choose Workspace</h2>
        <p class="selector-subtitle">Where should this note be saved?</p>

        <!-- Workspace List -->
        <div class="workspace-select-list">
          <!-- No Workspace Option -->
          <div class="workspace-select-item" :class="{ selected: tempSelectedWorkspaceId === null }"
            @click="tempSelectedWorkspaceId = null">
            <div class="no-ws-dot"></div>
            <span class="ws-name">No Workspace</span>
          </div>

          <!-- Real Workspaces -->
          <div v-for="ws in workspaces" :key="ws.id" class="workspace-select-item"
            :class="{ selected: tempSelectedWorkspaceId === ws.id }" @click="selectWorkspaceTemp(ws.id)">
            <div class="ws-dot" :style="{ background: ws.color }"></div>
            <span class="ws-name scroller">{{ ws.name }}</span>
            <span v-if="ws.subgroups?.length" class="sub-count">
              {{ ws.subgroups.length }} subgroup{{ ws.subgroups.length > 1 ? 's' : '' }}
            </span>
          </div>
        </div>

        <!-- Subgroup (appears only when workspace selected) -->
        <Transition name="sub-fade">
          <div v-if="tempSelectedWorkspaceId" class="subgroup-section">
            <label class="modal-label">Sub-Group <span class="optional">(optional)</span></label>
            <div class="subgroup-pills scroller">
              <!-- None pill -->
              <div class="sub-pill" :class="{ active: tempSelectedSubgroupIndex === 0 }"
                @click="tempSelectedSubgroupIndex = 0; tempSelectedSubgroup = null">
                None
              </div>
              <!-- Subgroup pills -->
              <div v-for="(sub, index) in tempCurrentSubgroups" :key="index" class="sub-pill scroller"
                :class="{ active: tempSelectedSubgroupIndex === index + 1 }"
                @click="tempSelectedSubgroupIndex = index + 1; tempSelectedSubgroup = sub.name">
                {{ sub.name }}
              </div>
            </div>
          </div>
        </Transition>

        <!-- Footer Buttons -->
        <div class="selector-actions">
          <button class="btn-secondary" @click="cancelWorkspaceSelection">Cancel</button>
          <button class="btn-primary" @click="confirmWorkspaceSelection">
            Continue
          </button>
        </div>
      </div>
    </div>




    <!--       @click.self="CloseBtn(null, 'note_making', null)" -->
    <div class="create_edit_model_container" :class="{ active: isAddBtnPressed }">
      <!-- Mobile View Editor Create Edit UI-->
      <dialog v-if="Toggle_Mobile_View" open="" ref="Note_Making_UI_Element" class="dialog dialog_mobile_full_page">
        <div class="create_edit_model_header create_edit_model_header_mobile_view">

          <div class="editor_top_element_1st_row_wrapper">
            <button ref="Note_Create_Close_btn" @click="CloseBtn('note_making')" class="btn close_note_create_edit_btn"
              title="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>

            <h3 ref="Note_heading_element" class="model_h3">Create Note</h3>
            <div class="Editor_Top_Panel_Right_Btns_Container">

              <button @click="DoneBtn" ref="DisableDoneBtnElement" class="btn" title="Done">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              </button>

              <button class="btn delete_media_panel_toggle_btn" @click="
                toggle_delete_model = !toggle_delete_model;
              View_Btn_Sound.play();
              " title="View Attachments Deletion Panel">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <!-- Trash Bin -->
                  <path d="M4 6h16" stroke="currentColor"></path>
                  <path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="currentColor"></path>
                  <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" stroke="currentColor"></path>

                  <!-- File Icon Inside Trash Bin -->
                  <rect x="9" y="9" width="6" height="8" rx="1" stroke="currentColor" fill="none"></rect>
                  <path d="M9 9l3-3 3 3" stroke="currentColor" fill="none"></path>

                  <!-- "X" Symbol Over File -->
                  <line x1="10" y1="12" x2="14" y2="16" stroke="currentColor"></line>
                  <line x1="14" y1="12" x2="10" y2="16" stroke="currentColor"></line>
                </svg>
              </button>

            </div>
          </div>

        </div>


        <div class="toolbar_ui">
          <div ref="Styling_Btns_Toolbar" class="attachmentBtns MarkDownMenu attachmentBtns_mobile_view"
            v-show="Toggle_MarkDown_Menu && !Toggle_Table_Menu">
            <!-- /// -->
            <div class="Styling_Btn_Container">

              <button ref="HeadingBtn" title="Heading" :class="{ 'Active_btn': isActive('heading') }"
                @click=" isActive('heading') ? commands.toggleHeading_off() : (Toggle_Heading = !Toggle_Heading, Settings_Style_Btns_Drop_Down_Menus($event, 'Simple_DropDown')); Tiptap_Editor.commands.focus();">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <!-- Rounded black background with gold border -->
                  <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700"
                    stroke-width="2" />
                  <!-- Centered text for heading -->
                  <text x="16" y="22" text-anchor="middle" font-family="Georgia" fill="#FFD700" font-weight="bold">
                    {{ currentHeading ? 'H' + currentHeading : 'H' }}
                  </text>
                </svg>
              </button>

              <div class="Styling_Btn_Levels" :class="{ Show_Styling_Btn_level: Toggle_Heading }">
                <button @click="commands.toggleHeading(1); Toggle_Heading = false">H1</button>
                <button @click="commands.toggleHeading(2); Toggle_Heading = false">H2</button>
                <button @click="commands.toggleHeading(3); Toggle_Heading = false">H3</button>
                <button @click="commands.toggleHeading(4); Toggle_Heading = false">H4</button>
                <button @click="commands.toggleHeading(5); Toggle_Heading = false">H5</button>
                <button @click="commands.toggleHeading(6); Toggle_Heading = false">H6</button>
              </div>

            </div>

            <button ref="BoldBtn" title="Bold" @click="commands.toggleBold" :class="{ 'Active_btn': isActive('bold') }">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <!-- Background -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />
                <!-- Bold letter -->
                <text x="16" y="22" text-anchor="middle" font-family="Georgia" fill="#FFD700" font-weight="bold">
                  B
                </text>
              </svg>
            </button>

            <!-- Font Size Button -->
            <div class="Styling_Btn_Container">

              <button ref="Font_Size_Btn" title="Font Size" :class="{ 'Active_btn': isFontSizeActive }"
                @click="isFontSizeActive ? commands.unsetFontSize() : (Toggle_Font_Size = !Toggle_Font_Size, Settings_Style_Btns_Drop_Down_Menus($event, 'Simple_DropDown')); Tiptap_Editor.commands.focus();">
                <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                  style="display: block">
                  <!-- Rounded square container -->
                  <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <g v-if="!currentFontSize">
                    <!-- Stylized A -->
                    <path d="M5 16.7L9.5 6.5L13.5 16.5" fill="none" stroke="#FFD700" stroke-width="1.5"
                      stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M8 12.5h3.6" fill="none" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" />

                    <g transform="translate(1 0)">
                      <path d="M17 7v10" fill="none" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" />
                      <path d="M15.5 8.5L17 7l1.5 1.5" fill="none" stroke="#FFD700" stroke-width="1.5"
                        stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M15.5 15.5L17 17l1.5-1.5" fill="none" stroke="#FFD700" stroke-width="1.5"
                        stroke-linecap="round" stroke-linejoin="round" />
                    </g>
                  </g>
                  <g v-else transform="scale(0.9)">
                    <text x="13" y="19" text-anchor="middle" font-family="Georgia" fill="#FFD700" font-weight="bold">
                      {{ currentFontSize.slice(0, -2) }}
                    </text>
                  </g>
                </svg>
              </button>

              <div class="Styling_Btn_Levels" :class="{ Show_Styling_Btn_level: Toggle_Font_Size }">
                <button @click="commands.setFontSize('8px'); Toggle_Font_Size = false">8</button>
                <button @click="commands.setFontSize('10px'); Toggle_Font_Size = false">10</button>
                <button @click="commands.setFontSize('12px'); Toggle_Font_Size = false">12</button>
                <button @click="commands.setFontSize('14px'); Toggle_Font_Size = false">14</button>
                <button @click="commands.setFontSize('16px'); Toggle_Font_Size = false">16</button>
                <button @click="commands.setFontSize('18px'); Toggle_Font_Size = false">18</button>
                <button @click="commands.setFontSize('20px'); Toggle_Font_Size = false">20</button>
                <button @click="commands.setFontSize('24px'); Toggle_Font_Size = false">24</button>
                <button @click="commands.setFontSize('28px'); Toggle_Font_Size = false">28</button>
                <button @click="commands.setFontSize('32px'); Toggle_Font_Size = false">32</button>
                <button @click="commands.setFontSize('34px'); Toggle_Font_Size = false">34</button>
                <button @click="commands.setFontSize('36px'); Toggle_Font_Size = false">36</button>
                <button @click="commands.setFontSize('38px'); Toggle_Font_Size = false">38</button>
                <button @click="commands.setFontSize('40px'); Toggle_Font_Size = false">40</button>
                <button @click="commands.setFontSize('42px'); Toggle_Font_Size = false">42</button>
                <button @click="commands.setFontSize('44px'); Toggle_Font_Size = false">44</button>
                <button @click="commands.setFontSize('46px'); Toggle_Font_Size = false">46</button>
                <button @click="commands.setFontSize('48px'); Toggle_Font_Size = false">48</button>
                <button @click="commands.setFontSize('50px'); Toggle_Font_Size = false">50</button>

              </div>

            </div>

            <!-- Spacing Button -->
            <div class="Styling_Btn_Container">

              <button ref="Line_Spacing_Btn" title="Line Spacing" :class="{ 'Active_btn': isLineHeightActive }"
                @click="isLineHeightActive ? commands.unsetLineHeight() : (Toggle_Line_Spacing = !Toggle_Line_Spacing, Settings_Style_Btns_Drop_Down_Menus($event, 'Simple_DropDown')); Tiptap_Editor.commands.focus();">
                <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                  style="display: block">
                  <!-- Rounded square container -->
                  <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <g v-if="!isLineHeightActive">
                    <!-- Mid text line (slightly LEFT) -->
                    <path d="M5.5 12h8" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />

                    <!-- Line-height indicator with arrows (much taller, slightly RIGHT) -->
                    <g transform="translate(1 0)">
                      <!-- vertical shaft (much longer) -->
                      <path d="M17 6.8v10.4" fill="none" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" />

                      <!-- up arrow (higher) -->
                      <path d="M15.8 8L17 6.8l1.2 1.2" fill="none" stroke="#FFD700" stroke-width="1.8"
                        stroke-linecap="round" stroke-linejoin="round" />

                      <!-- down arrow (lower) -->
                      <path d="M15.8 15.6L17 17.2l1.2-1.2" fill="none" stroke="#FFD700" stroke-width="1.8"
                        stroke-linecap="round" stroke-linejoin="round" />
                    </g>
                  </g>
                  <g v-else transform="scale(0.6)">
                    <text x="20" y="24" text-anchor="middle" font-family="Georgia" fill="#FFD700" font-weight="bold">
                      {{ currentLineHeight }}
                    </text>
                  </g>
                </svg>
              </button>

              <div class="Styling_Btn_Levels" :class="{ Show_Styling_Btn_level: Toggle_Line_Spacing }">
                <button @click="commands.setLineHeight(1.5); Toggle_Line_Spacing = false">1.5</button>
                <button @click="commands.setLineHeight(1.75); Toggle_Line_Spacing = false">1.75</button>
                <button @click="commands.setLineHeight(2); Toggle_Line_Spacing = false">2</button>
                <button @click="commands.setLineHeight(2.25); Toggle_Line_Spacing = false">2.25</button>
                <button @click="commands.setLineHeight(2.5); Toggle_Line_Spacing = false">2.5</button>
                <button @click="commands.setLineHeight(2.75); Toggle_Line_Spacing = false">2.75</button>
                <button @click="commands.setLineHeight(3); Toggle_Line_Spacing = false">3</button>
                <button @click="commands.setLineHeight(3.25); Toggle_Line_Spacing = false">3.25</button>
                <button @click="commands.setLineHeight(3.5); Toggle_Line_Spacing = false">3.5</button>
                <button @click="commands.setLineHeight(3.75); Toggle_Line_Spacing = false">3.75</button>
                <button @click="commands.setLineHeight(4); Toggle_Line_Spacing = false">4</button>
                <button @click="commands.setLineHeight(6); Toggle_Line_Spacing = false">6</button>
                <button @click="commands.setLineHeight(8); Toggle_Line_Spacing = false">8</button>
                <button @click="commands.setLineHeight(10); Toggle_Line_Spacing = false">10</button>

              </div>

            </div>



            <!-- Spacing Button -->
            <button title="Insert Line" @click="commands.insertHR()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display: block">
                <!-- Rounded square container -->
                <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Text lines -->
                <path d="M6 12h12M6 " fill="none" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round" />
              </svg>
            </button>

            <button ref="ItalicBtn" title="Italic" @click="commands.toggleItalic"
              :class="{ 'Active_btn': isActive('italic') }">
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <!-- Background -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Bold italic I with connected caps -->
                <g transform="skewX(-12) translate(4,0)">
                  <!-- vertical stem (slightly taller to touch bottom cap) -->
                  <rect x="14.5" y="9" width="3" height="14.5" fill="#FFD700" rx="1" />
                  <!-- top cap -->
                  <rect x="13.5" y="8" width="5" height="1.5" fill="#FFD700" rx="0.75" />
                  <!-- bottom cap (flush with skewed stem) -->
                  <rect x="13.5" y="23" width="5" height="1.5" fill="#FFD700" rx="0.75" />
                </g>
              </svg>
            </button>

            <button ref="CodeBtn" title="Code" :class="{ 'Active_btn': isActive('codeBlock') }"
              @click="commands.toggleCodeBlock()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display: block">
                <!-- Rounded square container -->
                <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Curly braces in gold -->
                <path d="M9 8c-1 1-1 2.5-1 4s0 3 1 4" fill="none" stroke="#FFD700" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
                <path d="M15 16c1-1 1-2.5 1-4s0-3-1-4" fill="none" stroke="#FFD700" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <button title="Inline Code" @click="commands.toggleInlineCode()"
              :class="{ 'Active_btn': isActive('code') }">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display: block">
                <!-- Rounded square container -->
                <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Left angle bracket -->
                <path d="M10 8 L7 12 L10 16" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />

                <!-- Right angle bracket -->
                <path d="M14 8 L17 12 L14 16" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />

                <!-- Inline code indicator (small horizontal bar) -->
                <path d="M9.5 18h5" fill="none" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </button>


            <!-- Text Alignment -->
            <div class="Styling_Btn_Container">

              <button ref="Text_Alignment_Btn" title="Text Alignment" :class="{ 'Active_btn': isTextAlignActive }"
                @click="isTextAlignActive ? commands.unsetTextAlign() : (Toggle_Text_Alignment = !Toggle_Text_Alignment, Settings_Style_Btns_Drop_Down_Menus($event, 'Simple_DropDown')); Tiptap_Editor.commands.focus();">
                <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                  style="display: block">
                  <!-- Rounded square container -->
                  <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <!-- Left-aligned text lines -->
                  <g v-if="!isTextAlignActive">
                    <path d="M6 8h10" fill="none" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" />
                    <path d="M6 12h7" fill="none" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" />
                    <path d="M6 16h9" fill="none" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" />
                  </g>
                  <g v-else transform="scale(0.9)">
                    <text x="14" y="19" text-anchor="middle" font-family="Georgia" fill="#FFD700" font-weight="bold">
                      {{ currentTextAlign.slice(0, 1).toUpperCase() }}
                    </text>
                  </g>
                </svg>
              </button>

              <div class="Styling_Btn_Levels"
                :class="[Toggle_Text_Alignment ? 'Show_Styling_Btn_level TextAlign_Styling_Btn_Levels' : '']">
                <button title="Left Alignment" @click="commands.setTextAlign('left'); Toggle_Text_Alignment = false">
                  <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                      stroke-width="2" />

                    <path d="M6 8h10M6 12h7M6 16h10" fill="none" stroke="#FFD700" stroke-width="2"
                      stroke-linecap="round" />
                  </svg>
                </button>

                <button title="Right Alignment" @click="commands.setTextAlign('right'); Toggle_Text_Alignment = false">
                  <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                      stroke-width="2" />

                    <path d="M8 8h10M11 12h7M8 16h10" fill="none" stroke="#FFD700" stroke-width="2"
                      stroke-linecap="round" />
                  </svg>
                </button>

                <button title="Center Alignment"
                  @click="commands.setTextAlign('center'); Toggle_Text_Alignment = false">
                  <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                      stroke-width="2" />

                    <path d="M7 8h10M9 12h6M7 16h10" fill="none" stroke="#FFD700" stroke-width="2"
                      stroke-linecap="round" />
                  </svg>
                </button>


                <button title="Justify Alignment"
                  @click="commands.setTextAlign('justify'); Toggle_Text_Alignment = false">
                  <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                      stroke-width="2" />

                    <path d="M6 8h12M6 12h12M6 16h12" fill="none" stroke="#FFD700" stroke-width="2"
                      stroke-linecap="round" />
                  </svg>
                </button>

              </div>

            </div>


            <!-- link btn -->
            <div class="Styling_Btn_Container">

              <button ref="Link_Btn" title="Link"
                @click="isActive('link') ? commands.unsetLink() : (Toggle_link = !Toggle_link, Settings_Style_Btns_Drop_Down_Menus($event)); Tiptap_Editor.commands.focus();"
                :class="{ Active_btn: isActive('link') }">
                <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                  style="display: block">
                  <!-- Rounded square container -->
                  <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <!-- Larger chain link: two ovals -->
                  <!-- Left oval -->
                  <path d="M4 12c0-2 1.6-3.5 3.5-3.5h2c2 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5h-2c-2 0-3.5-1.6-3.5-3.5z"
                    fill="none" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  <!-- Right oval -->
                  <path d="M11.5 12c0-2 1.6-3.5 3.5-3.5h2c2 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5h-2c-2 0-3.5-1.6-3.5-3.5z"
                    fill="none" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>

              <div style="width: auto;" class="Styling_Btn_Levels"
                :class="[Toggle_link ? 'Show_Styling_Btn_level link_Styling_Btn_Levels' : '']">

                <input class="title link_input" autofocus v-model="link.url" ref="LinkInputElement" type="text"
                  placeholder="Enter URL..." @keyup.enter="Apply_Link" />
                <div class="link_input_btns">
                  <button @click="Apply_Link">Apply</button>
                  <button @click="Toggle_link = false">Cancel</button>
                </div>


              </div>

            </div>


            <button title="Under Line" @click="commands.toggleUnderline();"
              :class="{ 'Active_btn': isActive('underline') }">
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <!-- Background rectangle -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Icon scaled + centered -->
                <g transform="translate(4.5,6.5) scale(1.4)">
                  <path fill="#FFD700" stroke="#FFD700" stroke-width="0.6"
                    d="M5.5 1a.5.5 0 0 1 .5.5v5a2.5 2.5 0 0 0 5 0v-5a.5.5 0 0 1 1 0v5a3.5 3.5 0 0 1-7 0v-5a.5.5 0 0 1 .5-.5z" />
                  <path fill="#FFD700" stroke="#FFD700" stroke-width="0.6"
                    d="M2.5 11.3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11z" />
                </g>
              </svg>
            </button>

            <button title="Strike" @click="commands.toggleStrike();" :class="{ 'Active_btn': isActive('strike') }">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <!-- Background -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Scaled + centered S -->
                <path
                  d="M22.9 4.3c-2.4-1.5-5.3-2.3-8.5-2.3C7.2 2 2 6.1 2 11.4c0 3.7 2.6 6.4 7.7 7.9l4.1 1.2c2.9.8 4.3 2 4.3 3.8 0 2.4-2.4 4-6.2 4-3.1 0-5.7-.9-8.1-2.7l-2.4 3.4c2.9 2.2 6.7 3.4 10.7 3.4 7 0 11.8-3.6 11.8-9.2 0-4.2-2.6-7-7.9-8.6l-4.3-1.3c-2.7-.8-4-1.9-4-3.6 0-2.2 2.1-3.7 5.4-3.7 2.8 0 5.2.7 7.3 2.1l2.3-3.4z"
                  fill="#FFD700" transform="translate(10,7.5) scale(0.45)" />

                <!-- Strike-through -->
                <line x1="8" y1="16" x2="24" y2="16" stroke="#FFD700" stroke-width="2.5" />
              </svg>
            </button>

            <button title="Checkbox" @click="commands.toggleTaskList();"
              :class="{ 'Active_btn': isActive('taskList') }">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
                <g transform="translate(12 12) scale(1.2) translate(-12 -12)">
                  <!-- Outer box -->
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="#FFD700" stroke-width="1.5" fill="none" />
                  <!-- Checkmark -->
                  <path d="M7 12l4 4 6-8" stroke="#FFD700" stroke-width="2" fill="none" stroke-linecap="round"
                    stroke-linejoin="round" />
                </g>
              </svg>
            </button>


            <div class="Styling_Btn_Container">
              <button ref="Font_Color_Btn" title="Font Color"
                @click="Is_Font_Color_Active ? (Toggle_Font_Color ? Toggle_Font_Color = false : commands.unsetColor()) : (Toggle_Font_Color = !Toggle_Font_Color, Settings_Style_Btns_Drop_Down_Menus($event)); Tiptap_Editor.commands.focus();"
                :class="{ Active_btn: Is_Font_Color_Active }">
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <!-- Black background with gold border -->
                  <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <!-- Large "A" in gold -->
                  <text x="16" y="21.5" text-anchor="middle" font-family="Georgia" font-weight="bold" fill="#FFD700">
                    A
                  </text>
                  <!-- Gold paint droplet to indicate color -->
                  <!-- You can tweak the path for a different droplet shape -->
                  <path d="M22 11 
                             c0 2 -3 3 -3 6 
                             s1.5 4 3 4 
                             s3 -1.5 3 -4 
                             s-3 -4 -3 -6z" fill="#FFD700" />
                </svg>
              </button>

              <div style="width: auto;" class="Styling_Btn_Levels"
                :class="[Toggle_Font_Color ? 'Show_Styling_Btn_level link_Styling_Btn_Levels' : '']">

                <div class="Color_Picker_Container">
                  <input @input="Update_Color_Picker_Preview('font')" ref="Font_Color_Picker_El" type="color"
                    class="colorPicker">
                  <div ref="Font_Color_Preview_El" class="preview"
                    @click="Apply_Color_To_Selected_Element('font'); Toggle_Font_Color = false">
                  </div>
                </div>
                <div class="Opacity_Slider_Container">
                  <label for="opacitySlider">Opacity:</label>
                  <input @input="Update_Color_Picker_Preview('font')" ref="Font_Color_Opacity_Slider_El" type="range"
                    id="opacitySlider" min="0" max="100" value="100">
                </div>


              </div>

            </div>



            <div class="Styling_Btn_Container">
              <button ref="Font_Highlight_Btn" title="Highlight Color"
                @click="isActive('highlight') ? (Toggle_Highlight_Color ? Toggle_Highlight_Color = false : commands.unsetHighlight()) : (Toggle_Highlight_Color = !Toggle_Highlight_Color, Settings_Style_Btns_Drop_Down_Menus($event)); Tiptap_Editor.commands.focus();"
                :class="{ Active_btn: isActive('highlight') }">
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <!-- Black background with gold border -->
                  <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <!-- Gold highlight rectangle behind the "A" -->
                  <rect x="8" y="9" width="16" height="14" fill="#FFD700" />

                  <!-- Large "A" in gold -->
                  <text x="16" y="21" text-anchor="middle" font-family="Georgia" font-weight="bold" fill="black">
                    A
                  </text>
                </svg>
              </button>

              <div style="width: auto;" class="Styling_Btn_Levels"
                :class="[Toggle_Highlight_Color ? 'Show_Styling_Btn_level link_Styling_Btn_Levels' : '']">

                <div class="Color_Picker_Container">
                  <input @input="Update_Color_Picker_Preview('highlight')" ref="Highlight_Color_Picker_El" type="color"
                    class="colorPicker">
                  <div ref="Highlight_Color_Preview_El" class="preview"
                    @click="Apply_Color_To_Selected_Element('highlight'); Toggle_Highlight_Color = false"></div>
                </div>
                <div class="Opacity_Slider_Container">
                  <label for="opacitySlider">Opacity:</label>
                  <input @input="Update_Color_Picker_Preview('highlight')" ref="Highlight_Color_Opacity_Slider_El"
                    type="range" id="opacitySlider" min="0" max="100" value="100">
                </div>

              </div>

            </div>



            <button title="Bullet Points" @click="commands.toggleBulletList();"
              :class="{ 'Active_btn': isActive('bulletList') }">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <!-- Background -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />
                <!-- Three bullet points with horizontal lines -->
                <circle cx="10" cy="10" r="2" fill="#FFD700" />
                <line x1="14" y1="10" x2="26" y2="10" stroke="#FFD700" stroke-width="2" />
                <circle cx="10" cy="16" r="2" fill="#FFD700" />
                <line x1="14" y1="16" x2="26" y2="16" stroke="#FFD700" stroke-width="2" />
                <circle cx="10" cy="22" r="2" fill="#FFD700" />
                <line x1="14" y1="22" x2="26" y2="22" stroke="#FFD700" stroke-width="2" />
              </svg>
            </button>

            <button title="Numer Wise" @click="commands.toggleOrderedList();"
              :class="{ 'Active_btn': isActive('orderedList') }">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <!-- Background -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />
                <g font-weight="bolder">
                  <text x="6" y="11" font-family="Georgia" font-size="10" fill="#FFD700">
                    1
                  </text>
                  <text x="6" y="20" font-family="Georgia" font-size="10" fill="#FFD700">
                    2
                  </text>
                  <text x="6" y="29" font-family="Georgia" font-size="10" fill="#FFD700">
                    3
                  </text>
                </g>
                <!-- Corresponding horizontal lines for list items -->
                <line x1="14" y1="8" x2="26" y2="8" stroke="#FFD700" stroke-width="2" />
                <line x1="14" y1="16.5" x2="26" y2="16.5" stroke="#FFD700" stroke-width="2" />
                <line x1="14" y1="25" x2="26" y2="25" stroke="#FFD700" stroke-width="2" />
              </svg>
            </button>



            <div class="Styling_Btn_Container">
              <button ref="Block_BG_Color_Btn" title="Change Block Background Color"
                @click="Is_Block_Background_Color_Active ? (Toggle_Block_Background_Color ? Toggle_Block_Background_Color = false : commands.toggle_block_bg()) : (Toggle_Block_Background_Color = !Toggle_Block_Background_Color, Settings_Style_Btns_Drop_Down_Menus($event)); Tiptap_Editor.commands.focus();"
                :class="{ Active_btn: Is_Block_Background_Color_Active }">
                <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                  style="display: block">
                  <!-- Container -->
                  <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <!-- Background bar -->
                  <rect x="4" y="8" width="16" height="6" rx="2" fill="#FFD700" opacity="0.8" />

                  <!-- Paragraph text lines -->
                  <path d="M4 6h16" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M4 16h16" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" />
                </svg>
              </button>

              <div style="width: auto;" class="Styling_Btn_Levels"
                :class="[Toggle_Block_Background_Color ? 'Show_Styling_Btn_level link_Styling_Btn_Levels' : '']">

                <div class="Color_Picker_Container">
                  <input @input="Update_Color_Picker_Preview('block_bg')" ref="Block_BG_Color_Picker_El" type="color"
                    class="colorPicker">
                  <div ref="Block_BG_Color_Preview_El" class="preview"
                    @click="Apply_Color_To_Selected_Element('block_bg'); Toggle_Block_Background_Color = false">
                  </div>
                </div>
                <div class="Opacity_Slider_Container">
                  <label for="opacitySlider">Opacity:</label>
                  <input @input="Update_Color_Picker_Preview('block_bg')" ref="Block_BG_Color_Opacity_Slider_El"
                    type="range" id="opacitySlider" min="0" max="100" value="100">
                </div>

              </div>

            </div>


            <button title="Quote" @click="commands.toggleBlockquote();"
              :class="{ 'Active_btn': isActive('blockquote') }">
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <!-- Background rectangle -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Scaled + centered icon -->
                <g transform="translate(3,2.5) scale(1.65)" fill="#FFD700" stroke="#FFD700" stroke-width="0.5">
                  <path
                    d="M2.5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm5 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6zm0 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6zm-5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm.79-5.373c.112-.078.26-.17.444-.275L3.524 6c-.122.074-.272.17-.452.287-.18.117-.35.26-.51.428a2.425 2.425 0 0 0-.398.562c-.11.207-.164.438-.164.692 0 .36.072.65.217.873.144.219.385.328.72.328.215 0 .383-.07.504-.211a.697.697 0 0 0 .188-.463c0-.23-.07-.404-.211-.521-.137-.121-.326-.182-.568-.182h-.282c.024-.203.065-.37.123-.498a1.38 1.38 0 0 1 .252-.37 1.94 1.94 0 0 1 .346-.298zm2.167 0c.113-.078.262-.17.445-.275L5.692 6c-.122.074-.272.17-.452.287-.18.117-.35.26-.51.428a2.425 2.425 0 0 0-.398.562c-.11.207-.164.438-.164.692 0 .36.072.65.217.873.144.219.385.328.72.328.215 0 .383-.07.504-.211a.697.697 0 0 0 .188-.463c0-.23-.07-.404-.211-.521-.137-.121-.326-.182-.568-.182h-.282a1.75 1.75 0 0 1 .118-.492c.058-.13.144-.254.257-.375a1.94 1.94 0 0 1 .346-.3z" />
                </g>
              </svg>
            </button>

            <button title="Hard Break" @click="commands.insertHardBreak();"
              :class="{ 'Active_btn': isActive('hardBreak') }">
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <!-- Outer container -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Top text line -->
                <line x1="7" y1="11" x2="19" y2="11" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />

                <!-- Bottom text line -->
                <line x1="7" y1="21" x2="19" y2="21" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />

                <!-- Forced break indicator (vertical bar) -->
                <line x1="22" y1="9" x2="22" y2="19" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />

                <!-- Down arrow (hard action) -->
                <path d="M22 19l-3-3m3 3l3-3" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>

            <div class="Styling_Btn_Container">

              <button ref="Table_Btn" title="Table"
                @click="isActive('table') ? (commands.deleteTable(), Toggle_Table = false) : (Toggle_Table = !Toggle_Table, Settings_Style_Btns_Drop_Down_Menus($event)); Tiptap_Editor.commands.focus();"
                :class="{ Active_btn: isActive('table') }">
                <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                  style="display: block">
                  <!-- Rounded square container -->
                  <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <!-- Table outer border -->
                  <rect x="6" y="6" width="12" height="12" rx="1" ry="1" fill="none" stroke="#FFD700"
                    stroke-width="1.8" />

                  <!-- Vertical grid lines -->
                  <path d="M10 6v12M14 6v12" fill="none" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round" />

                  <!-- Horizontal grid lines -->
                  <path d="M6 10h12M6 14h12" fill="none" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round" />
                </svg>
              </button>


              <div style="width: auto;" class="Styling_Btn_Levels"
                :class="[Toggle_Table ? 'Show_Styling_Btn_level link_Styling_Btn_Levels' : '']">

                <div class="table_input_container">
                  <input class="title link_input" autofocus v-model="Table_Input.columns" type="number"
                    placeholder="Row" @keyup.enter="$event.target.nextElementSibling.focus()" />

                  <input class="title link_input" autofocus v-model="Table_Input.rows" type="number" placeholder="Col"
                    @keyup.enter="Table_Input.rows > 0 && Table_Input.columns > 0 ? Table_Input.rows <= 50 && Table_Input.columns <= 50 ? (commands.insertTable(Table_Input.rows, Table_Input.columns), Toggle_Table = false) : Show_Create_Edit_Model_Warning('❌ More than 50 rows and columns not allowed.', 2000) : Show_Create_Edit_Model_Warning('❌ Invalid Input.', 2000)" />
                </div>


                <div class="link_input_btns">
                  <button
                    @click="Table_Input.rows > 0 && Table_Input.columns > 0 ? Table_Input.rows <= 50 && Table_Input.columns <= 50 ? (commands.insertTable(Table_Input.rows, Table_Input.columns), Toggle_Table = false) : Show_Create_Edit_Model_Warning('❌ More than 50 rows and columns not allowed.', 2000) : Show_Create_Edit_Model_Warning('❌ Invalid Input.', 2000)">Apply</button>
                  <button @click="Toggle_Table = false; Tiptap_Editor.commands.focus();">Cancel</button>
                </div>


              </div>

            </div>

            <button @click="commands.clearInlineStyles">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <!-- Rounded square border (10% larger) -->
                <rect x="0.45" y="0.45" width="23.1" height="23.1" rx="4.4" ry="4.4" stroke="#FFD700" stroke-width="2"
                  fill="none" />

                <!-- Eraser group scaled 30% larger from center -->
                <g transform="translate(12 10) scale(1.2) translate(-12 -12)">
                  <!-- Eraser body (tilted) -->
                  <path
                    d="M7.5 15.5 L14.5 8.5 Q15.2 7.8 16 8.2 L17.5 9.5 Q18.2 10.2 17.8 11 L10.8 18 Q10.1 18.7 9.3 18.3 L7.8 17 Q7.1 16.3 7.5 15.5 Z"
                    stroke="#FFD700" stroke-width="1.5" stroke-linejoin="round" fill="none" />

                  <!-- Middle band on eraser -->
                  <path d="M10.2 12.8 L13.2 9.8" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round"
                    fill="none" />

                  <!-- Base line under eraser -->
                  <line x1="5.5" y1="20" x2="17.5" y2="20" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round"
                    fill="none" />
                </g>
              </svg>
            </button>

            <button title="Toggle Table Menu" v-if="isActive('table')"
              @click="Toggle_Table_Menu = true; Toggle_Table_Menu_To_Scroll_Event(); Tiptap_Editor.commands.focus();">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <!-- Container -->
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(0.5,0)">
                  <rect x="4.5" y="6" width="11" height="12" fill="none" stroke="#FFD700" stroke-width="1.6" />
                  <path d="M4.5 10h11M4.5 14h11M8.2 6v12M11.8 6v12" stroke="#FFD700" stroke-width="1.4"
                    stroke-linecap="round" />
                </g>

                <g transform="translate(1,0)">
                  <!-- Menu dots -->
                  <circle cx="18.2" cy="9" r="1" fill="#FFD700" />
                  <circle cx="18.2" cy="12" r="1" fill="#FFD700" />
                  <circle cx="18.2" cy="15" r="1" fill="#FFD700" />
                </g>

              </svg>
            </button>

            <button title="Undo" @click="commands.undo();" :class="{ 'Active_btn': Tiptap_Editor.can().undo() }">
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <!-- Background rectangle -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Undo icon scaled + centered -->
                <g transform="translate(5,5) scale(0.18)">
                  <path d="M4.73,9.3v39.28h39.28l4.63,0l-3.27-3.28L33.91,33.85c0.76-0.73,1.54-1.44,2.36-2.11
      c1.08-0.88,2.22-1.72,3.38-2.48l0,0c6.02-3.92,13.21-6.21,20.94-6.21l0.01,0v-0.01c10.59,0,20.18,4.3,27.12,11.24
      c6.94,6.94,11.24,16.53,11.24,27.11h-0.01v0.05h0.01c0,10.59-4.3,20.19-11.24,27.12c-6.94,6.94-16.53,11.24-27.11,11.24v-0.01
      l-0.08,0v0.01c-3.7,0-7.39-0.54-10.93-1.59v0c-1.95-0.58-3.87-1.33-5.71-2.22c-9.39-4.54-16.65-12.8-19.87-22.87l-0.43-1.33
      L0,71.82l0.47,2.3l0.01,0.06v0.01c0.8,3.84,2,7.62,3.53,11.24v0.01c1.51,3.55,3.38,6.98,5.53,10.19
      c11.03,16.43,29.78,27.25,51.05,27.25l0.01,0v-0.01c16.96,0,32.33-6.88,43.43-17.99v-0.01c11.1-11.11,17.98-26.45,17.98-43.4
      l0.01,0v-0.05h-0.01c0-16.96-6.88-32.32-18-43.43l0,0C92.93,6.89,77.58,0.02,60.63,0.01V0l-0.06,0v0.01
      c-8.71,0-17.01,1.82-24.51,5.1c-1.21,0.53-2.42,1.11-3.6,1.71c-5.48,2.83-10.47,6.46-14.83,10.74L8,7.95
      L4.73,4.67V9.3L4.73,9.3L4.73,9.3z" fill="none" stroke="#FFD700" stroke-width="10" stroke-linejoin="round"
                    stroke-linecap="round" />
                </g>
              </svg>
            </button>

            <button title="Redo" @click="commands.redo();" :class="{ 'Active_btn': Tiptap_Editor.can().redo() }">
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <!-- Background rectangle -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Redo icon (mirrored + scaled + centered) -->
                <g transform="translate(27,5) scale(-0.18,0.18)">
                  <path d="M4.73,9.3v39.28h39.28l4.63,0l-3.27-3.28L33.91,33.85c0.76-0.73,1.54-1.44,2.36-2.11
      c1.08-0.88,2.22-1.72,3.38-2.48l0,0c6.02-3.92,13.21-6.21,20.94-6.21l0.01,0v-0.01c10.59,0,20.18,4.3,27.12,11.24
      c6.94,6.94,11.24,16.53,11.24,27.11h-0.01v0.05h0.01c0,10.59-4.3,20.19-11.24,27.12c-6.94,6.94-16.53,11.24-27.11,11.24v-0.01
      l-0.08,0v0.01c-3.7,0-7.39-0.54-10.93-1.59v0c-1.95-0.58-3.87-1.33-5.71-2.22c-9.39-4.54-16.65-12.8-19.87-22.87l-0.43-1.33
      L0,71.82l0.47,2.3l0.01,0.06v0.01c0.8,3.84,2,7.62,3.53,11.24v0.01c1.51,3.55,3.38,6.98,5.53,10.19
      c11.03,16.43,29.78,27.25,51.05,27.25l0.01,0v-0.01c16.96,0,32.33-6.88,43.43-17.99v-0.01c11.1-11.11,17.98-26.45,17.98-43.4
      l0.01,0v-0.05h-0.01c0-16.96-6.88-32.32-18-43.43l0,0C92.93,6.89,77.58,0.02,60.63,0.01V0l-0.06,0v0.01
      c-8.71,0-17.01,1.82-24.51,5.1c-1.21,0.53-2.42,1.11-3.6,1.71c-5.48,2.83-10.47,6.46-14.83,10.74L8,7.95
      L4.73,4.67V9.3L4.73,9.3L4.73,9.3z" fill="none" stroke="#FFD700" stroke-width="10" stroke-linejoin="round"
                    stroke-linecap="round" />
                </g>
              </svg>
            </button>

            <button title="Copy" @click="commands.copyContentToClipboard('editor');">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <!-- Back sheet -->
                <rect x="6" y="5" width="20" height="24" rx="3" fill="none" stroke="#FFD700" stroke-width="2" />
                <!-- Front sheet -->
                <rect x="3" y="1" width="20" height="24" rx="3" fill="none" stroke="#FFD700" stroke-width="2" />
              </svg>
            </button>

            <button class="close_Mark_Down_Menu" @click="
              Toggle_MarkDown_Menu = false;
            " title="Close MarkUp Menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
            <!-- ///////////// -->
          </div>

          <!-- Table toolbar (attached UI) -->
          <div ref="Table_Styling_Btns_Toolbar" v-if="Toggle_Table_Menu"
            class="attachmentBtns MarkDownMenu attachmentBtns_mobile_view">

            <button title="Add Row Before" @click="commands.addRowBefore()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(0,1)">
                  <rect x="6" y="8" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                  <path d="M6 11h12M6 15h12" stroke="#FFD700" stroke-width="1.4" />
                  <path d="M10 7v10M14 7v10" stroke="#FFD700" stroke-width="1.4" />
                </g>
                <!-- Plus (top) -->
                <g transform="translate(0,-0.8)">
                  <path d="M12 4v4M10 6h4" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>
              </svg>
            </button>

            <button title="Add Row After" @click="commands.addRowAfter()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(0,-3)">
                  <rect x="6" y="8" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                  <path d="M6 11h12M6 15h12" stroke="#FFD700" stroke-width="1.4" />
                  <path d="M10 7v10M14 7v10" stroke="#FFD700" stroke-width="1.4" />
                </g>
                <!-- Plus (top) -->
                <g transform="translate(0,0.5)">
                  <!-- Plus (bottom) -->
                  <path d="M12 20v-4M10 18h4" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>
              </svg>
            </button>

            <button title="Delete Row" @click="commands.deleteRow()">
              <svg width="34" height="35" viewBox="0 0 26 27" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="24" height="25" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(1,0.8)">
                  <rect x="6" y="8" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                  <path d="M6 11h12M6 15h12" stroke="#FFD700" stroke-width="1.4" />
                  <path d="M10 7v10M14 7v10" stroke="#FFD700" stroke-width="1.4" />
                </g>
                <!-- Minus (top) -->
                <g transform="translate(1,0.1)">
                  <path d="M8 5h8" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>

                <!-- Minus (bottom) -->
                <g transform="translate(1,17.5)">
                  <path d="M8 5h8" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>

              </svg>
            </button>


            <button title="Add Column Before" @click="commands.addColumnBefore()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(2,-1)">
                  <rect x="6" y="8" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                  <path d="M6 11h12M6 15h12" stroke="#FFD700" stroke-width="1.4" />
                  <path d="M10 7v10M14 7v10" stroke="#FFD700" stroke-width="1.4" />
                </g>
                <!-- Plus (left) -->
                <g transform="translate(-1,0)">
                  <path d="M4 12h4M6 10v4" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>
              </svg>
            </button>


            <button title="Add Column After" @click="commands.addColumnAfter()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(-2,-1)">
                  <rect x="6" y="8" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                  <path d="M6 11h12M6 15h12" stroke="#FFD700" stroke-width="1.4" />
                  <path d="M10 7v10M14 7v10" stroke="#FFD700" stroke-width="1.4" />
                </g>
                <!-- Plus (right) -->
                <g transform="translate(1,0)">
                  <path d="M20 12h-4M18 10v4" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>
              </svg>
            </button>

            <button title="Delete Column" @click="commands.deleteColumn()">

              <svg width="35" height="32" viewBox="0 0 26 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="24" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(1,-0.9)">
                  <rect x="6" y="8" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                  <path d="M6 11h12M6 15h12" stroke="#FFD700" stroke-width="1.4" />
                  <path d="M10 7v10M14 7v10" stroke="#FFD700" stroke-width="1.4" />
                </g>
                <!-- Minus (left) -->
                <g transform="translate(9,0) rotate(90)">
                  <path d="M8 5h8" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>
                <!-- Minus (right) -->
                <g transform="translate(26.8, 0) rotate(90)">
                  <path d="M8 5h8" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>
              </svg>
            </button>


            <div class="Styling_Btn_Container">
              <button ref="Table_Cell_BG_Color_Btn" title="Table Cell Background Color"
                @click="Is_Table_Cell_Background_Color_Active ? (Toggle_Table_Cell_Background_Color ? Toggle_Table_Cell_Background_Color = false : commands.unsetTableCellBackgroundColor()) : (Toggle_Table_Cell_Background_Color = !Toggle_Table_Cell_Background_Color, Settings_Style_Btns_Drop_Down_Menus($event)); Tiptap_Editor.commands.focus();"
                :class="{ Active_btn: Is_Table_Cell_Background_Color_Active }">
                <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">

                  <!-- Container -->
                  <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                  <!-- Table outline -->
                  <rect x="4.5" y="6" width="15" height="12" fill="none" stroke="#FFD700" stroke-width="1.6" />

                  <!-- Vertical divider -->
                  <line x1="12" y1="6" x2="12" y2="18" stroke="#FFD700" stroke-width="1.4" />

                  <!-- Horizontal divider -->
                  <line x1="4.5" y1="12" x2="19.5" y2="12" stroke="#FFD700" stroke-width="1.4" />

                  <!-- Highlighted cell (background color) -->
                  <rect x="12" y="12" width="7.5" height="6" fill="#FFD700" opacity="0.35" />

                </svg>
              </button>

              <div style="width: auto;" class="Styling_Btn_Levels"
                :class="[Toggle_Table_Cell_Background_Color ? 'Show_Styling_Btn_level link_Styling_Btn_Levels' : '']">

                <div class="Color_Picker_Container">
                  <input @input="Update_Color_Picker_Preview('table_cell_bg')" ref="Table_Cell_BG_Color_Picker_El"
                    type="color" class="colorPicker">
                  <div ref="Table_Cell_BG_Color_Preview_El" class="preview"
                    @click="Apply_Color_To_Selected_Element('table_cell_bg'); Toggle_Table_Cell_Background_Color = false">
                  </div>
                </div>
                <div class="Opacity_Slider_Container">
                  <label for="opacitySlider">Opacity:</label>
                  <input @input="Update_Color_Picker_Preview('table_cell_bg')"
                    ref="Table_Cell_BG_Color_Opacity_Slider_El" type="range" id="opacitySlider" min="0" max="100"
                    value="100">
                </div>

              </div>
            </div>

            <!-- merge and split cells btns for row op -->
            <button title="Merge Cells" @click="commands.mergeCells()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <!-- Container -->
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Single cell -->
                <rect x="6" y="7" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />

                <!-- Split guide -->
                <path d="M12 9v6" stroke="#FFD700" stroke-width="1.4" stroke-dasharray="0 0" />

                <!-- Outward arrows -->
                <path d="M10 12l-1.5-1.5M10 12l-1.5 1.5" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round" />
                <path d="M14 12l1.5-1.5M14 12l1.5 1.5" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>

            <button title="Split Cell" @click="commands.splitCell()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <!-- Container -->
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Two cells -->
                <rect x="4.5" y="7" width="6" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                <rect x="13.5" y="7" width="6" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />

                <!-- Center line (max reach, same thickness) -->
                <path d="M8.5 12h7" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />

                <!-- Left arrow (very wide) -->
                <path d="M6.6 12l1.9-1.9M6.6 12l1.9 1.9" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round"
                  stroke-linejoin="round" />

                <!-- Right arrow (very wide) -->
                <path d="M17.4 12l-1.9-1.9M17.4 12l-1.9 1.9" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>


            <button title="Toggle First Row As Header" @click="commands.toggleHeaderRow()">
              <svg width="32" height="32" viewBox="0 0 24 24">
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <rect x="6" y="7" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                <rect x="6" y="7" width="12" height="4" fill="none" stroke="#FFD700" stroke-width="2" />
              </svg>
            </button>

            <button title="Toggle First Column As Header" @click="commands.toggleHeaderColumn()">
              <svg width="32" height="32" viewBox="0 0 24 24">
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <rect x="7" y="6" width="10.5" height="12" fill="none" stroke="#FFD700" stroke-width="1.6" />
                <rect x="7" y="6" width="4" height="12" fill="none" stroke="#FFD700" stroke-width="2" />
              </svg>
            </button>

            <button title="Toggle Current Cell As Header"
              @click="commands.toggleHeaderCell(); Tiptap_Editor.commands.focus();">
              <svg width="32" height="32" viewBox="0 0 24 24">
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <rect x="6" y="9.5" width="12" height="4.5" fill="none" stroke="#FFD700" stroke-width="2" />
              </svg>
            </button>

            <button title="Move Row Up" @click="commands.moveTableRowUp(); Tiptap_Editor.commands.focus();">
              <svg width="32" height="34" viewBox="0 0 24 27" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="22" height="25" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <rect x="5" y="10" width="14" height="12" fill="none" stroke="#FFD700" stroke-width="1.6" />
                <path d="M5 10h14M5 14h14" stroke="#FFD700" stroke-width="1.4" />

                <!-- Selected row -->
                <rect x="5" y="14" width="14" height="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <g transform="translate(0,0)">

                  <!-- Up arrow -->
                  <path d="M12 4v4M10 6l2-2l2 2" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round"
                    stroke-linejoin="round" />
                </g>
              </svg>
            </button>

            <button title="Move Row Down" @click="commands.moveTableRowDown(); Tiptap_Editor.commands.focus();">
              <svg width="32" height="34" viewBox="0 0 24 27" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="22" height="25" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <rect x="5" y="5" width="14" height="12" fill="none" stroke="#FFD700" stroke-width="1.6" />


                <!-- Selected row -->
                <rect x="5" y="9" width="14" height="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <g transform="translate(0,3)">

                  <!-- Down arrow -->
                  <path d="M12 20v-4M10 18l2 2l2-2" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round"
                    stroke-linejoin="round" />
                </g>

              </svg>
            </button>

            <button title="Move Column Left" @click="commands.moveTableColumnLeft(); Tiptap_Editor.commands.focus();">
              <svg width="34" height="32" viewBox="0 0 27 24">
                <rect x="1" y="1" width="25" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(4.5,0)">
                  <rect x="6" y="5" width="12" height="14" fill="none" stroke="#FFD700" stroke-width="1.6" />

                  <!-- Selected column -->
                  <rect x="10" y="5" width="4" height="14" fill="none" stroke="#FFD700" stroke-width="2" />
                </g>

                <g transform="translate(0,0)">
                  <!-- Left arrow -->
                  <path d="M4 12h4M6 10l-2 2l2 2" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round"
                    stroke-linejoin="round" />
                </g>

              </svg>
            </button>

            <button title="Move Column Right" @click="commands.moveTableColumnRight(); Tiptap_Editor.commands.focus();">
              <svg width="34" height="32" viewBox="0 0 27 24">
                <rect x="1" y="1" width="25" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(-1,0)">
                  <rect x="6" y="5" width="12" height="14" fill="none" stroke="#FFD700" stroke-width="1.6" />

                  <!-- Selected column -->
                  <rect x="10" y="5" width="4" height="14" fill="none" stroke="#FFD700" stroke-width="2" />
                </g>

                <g transform="translate(3.2,0)">
                  <!-- Right arrow -->
                  <path d="M20 12h-4M18 10l2 2l-2 2" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round"
                    stroke-linejoin="round" />
                </g>

              </svg>
            </button>


            <button title="Clear Selected Cells Content"
              @click="commands.clearSelectedTableCells(); Tiptap_Editor.commands.focus();">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <!-- Outer container -->
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Eraser -->
                <path d="M7 14.5l6.5-6.5c.6-.6 1.6-.6 2.2 0l2.3 2.3c.6.6.6 1.6 0 2.2L12.5 18H9.2z" fill="none"
                  stroke="#FFD700" stroke-width="1.8" stroke-linejoin="round" />

                <!-- Ground line -->
                <line x1="6" y1="18" x2="18" y2="18" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>

            <button class="close_Mark_Down_Menu" @click="Toggle_Table_Menu = false; Toggle_Table_Menu_To_Scroll_Event(); Tiptap_Editor.commands.focus();
            " title="Close Table Menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="attachmentBtns attachmentBtns_mobile_view" v-if="!Toggle_MarkDown_Menu && !Toggle_Table_Menu">
            <label for="fileInput" class="custom_Choose_file" title="Attach File"
              @click.prevent="Show_Select_Input_Source_Selection">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 1 24 24" fill="none"
                stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <!-- Folder Outline -->
                <path
                  d="M2 7C2 5.9 2.9 5 4 5H10L12 7H20C21.1 7 22 7.9 22 9V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V7Z">
                </path>
                <!-- Document Outline -->
                <rect x="6.5" y="9" width="11" height="10" stroke="white" stroke-width="1.5"></rect>
                <line x1="8" y1="11" x2="14" y2="11" stroke="white" stroke-width="1.5"></line>
                <line x1="8" y1="13" x2="14" y2="13" stroke="white" stroke-width="1.5"></line>
              </svg>
            </label>

            <input type="file" id="fileInput" ref="fileInput_tag_ref"
              @change="async (file) => await manageMedia(file, false, null, false)" />

            <!--  -->
            <!-- Overlay -->
            <div v-if="Show_Overlay" class="style-dialog-overlay" @click.self="cancelDialog">
              <!-- Choice Dialog -->
              <div v-if="Show_Choice_Dialog" class="style-dialog">
                <h2>Select Source</h2>

                <button class="option" @click="chooseSource('local')"
                  :disabled="(Is_AI_Edit_Starte || OCR_Processing || isRecording)">
                  <div class="select_file_source_wrapper">
                    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                      <!-- frame -->
                      <rect x="2" y="2" width="60" height="60" rx="12" ry="12" fill="none" stroke="#FFD700"
                        stroke-width="4" />

                      <!-- icon -->
                      <g transform="translate(7.5,6) ">
                        <rect x="4" y="20" width="40" height="20" rx="4" fill="none" stroke="#FFD700"
                          stroke-width="5" />

                        <circle cx="36" cy="30" r="3" stroke="#FFD700" stroke-width="4.4" fill="none" />

                        <path d="M24 6 L24 22" stroke="#FFD700" stroke-width="4.4" stroke-linecap="round" />

                        <path d="M16 16 L24 24 L32 16" stroke="#FFD700" stroke-width="4.4" stroke-linecap="round"
                          stroke-linejoin="round" />
                      </g>
                    </svg>

                    <span> Attach From Device </span>
                  </div>
                </button>

                <button class="option" @click="chooseSource('online')"
                  :disabled="(Is_AI_Edit_Starte || OCR_Processing || isRecording)">
                  <div class="select_file_source_wrapper">
                    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                      <!-- frame -->
                      <rect x="2" y="2" width="60" height="60" rx="12" ry="12" fill="none" stroke="#FFD700"
                        stroke-width="4" />

                      <!-- icon -->
                      <g transform="translate(3,3)">
                        <path d="M12 30 A8 8 0 0 1 20 22 A10 10 0 0 1 40 26 A8 8 0 0 1 40 42 H16 A8 8 0 0 1 12 30 Z"
                          fill="none" stroke="#FFD700" stroke-width="4.4" stroke-linecap="round"
                          stroke-linejoin="round" />

                        <path d="M28 18 L28 34" stroke="#FFD700" stroke-width="4.4" stroke-linecap="round" />

                        <path d="M20 28 L28 36 L36 28" stroke="#FFD700" stroke-width="4.4" stroke-linecap="round"
                          stroke-linejoin="round" />
                      </g>
                    </svg>
                    <span> Attach Online </span>
                  </div>
                </button>

                <button :disabled="Is_AI_Edit_Started || OCR_Processing || isRecording" class="option ocr"
                  @click="chooseSource('OCR')">
                  <div class="select_file_source_wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512" fill="none">
                      <!-- Scan Corners -->
                      <path d="M96 176V128C96 110 110 96 128 96H176" stroke="#FFD700" stroke-width="28"
                        stroke-linecap="round" stroke-linejoin="round" />

                      <path d="M336 96H384C402 96 416 110 416 128V176" stroke="#FFD700" stroke-width="28"
                        stroke-linecap="round" stroke-linejoin="round" />

                      <path d="M416 336V384C416 402 402 416 384 416H336" stroke="#FFD700" stroke-width="28"
                        stroke-linecap="round" stroke-linejoin="round" />

                      <path d="M176 416H128C110 416 96 402 96 384V336" stroke="#FFD700" stroke-width="28"
                        stroke-linecap="round" stroke-linejoin="round" />

                      <!-- Center OCR/Text -->
                      <rect x="148" y="168" width="216" height="36" rx="18" fill="#FFD700" />

                      <rect x="148" y="244" width="150" height="36" rx="18" fill="#FFD700" />

                      <rect x="148" y="320" width="110" height="36" rx="18" fill="#FFD700" />
                    </svg>

                    <div class="select_file_OCR_text_wrapper">
                      <span> OCR Extract Text </span>
                      <div class="Upload_Loader OCR_loader" :class="{ 'Upload_Loader_active': OCR_Processing }"></div>
                    </div>

                  </div>
                </button>

              </div>

              <div v-if="Show_Type_Dialog" class="style-dialog">
                <h2>Select Media Type</h2>

                <button class="option" @click="chooseType('audio')">
                  <div class="select_file_source_wrapper">
                    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                      <!-- frame -->
                      <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="#FFD700" stroke-width="4" />

                      <!-- music note -->
                      <g transform="translate(0,8)">
                        <!-- stem -->
                        <path d="M26 6 L26 34" stroke="#FFD700" stroke-width="4" stroke-linecap="round" />

                        <!-- arm -->
                        <path d="M26 6 L42 2" stroke="#FFD700" stroke-width="4" stroke-linecap="round"
                          stroke-linejoin="round" />

                        <!-- right stem down -->
                        <path d="M42 2 L42 30" stroke="#FFD700" stroke-width="4" stroke-linecap="round" />

                        <!-- left note head -->
                        <circle cx="20" cy="38" r="8" stroke="#FFD700" stroke-width="4" fill="none" />

                        <!-- right note head -->
                        <circle cx="42" cy="34" r="8" stroke="#FFD700" stroke-width="4" fill="none" />

                        <!-- left head connector -->
                        <path d="M26 34 L20 38" stroke="#FFD700" stroke-width="4" stroke-linecap="round" />

                        <!-- right head connector -->
                        <path d="M42 30 L42 34" stroke="#FFD700" stroke-width="4" stroke-linecap="round" />
                      </g>
                    </svg>
                    <span> Audio </span>
                  </div>
                </button>

                <button class="option" @click="chooseType('video')">
                  <div class="select_file_source_wrapper">
                    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                      <!-- frame -->
                      <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="#FFD700" stroke-width="4" />

                      <!-- play window -->
                      <g transform="translate(8,16)">
                        <rect x="4" y="4" width="32" height="24" rx="4" fill="none" stroke="#FFD700" stroke-width="4" />

                        <polygon points="18,10 28,16 18,22" fill="none" stroke="#FFD700" stroke-width="4"
                          stroke-linejoin="round" />

                        <rect x="40" y="8" width="6" height="16" rx="2" fill="none" stroke="#FFD700" stroke-width="4" />
                      </g>
                    </svg>
                    <span> Video </span>
                  </div>
                </button>

                <button class="option" @click="chooseType('image')">
                  <div class="select_file_source_wrapper">
                    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                      <!-- frame -->
                      <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="#FFD700" stroke-width="4" />

                      <!-- image window -->
                      <g transform="translate(10,13)">
                        <rect x="4" y="4" width="36" height="30" rx="4" fill="none" stroke="#FFD700" stroke-width="4" />

                        <!-- sun -->
                        <circle cx="30" cy="14" r="5" stroke="#FFD700" stroke-width="4" fill="none" />

                        <!-- mountain left -->
                        <path d="M8 32 L20 20 L28 28 L40 14" stroke="#FFD700" stroke-width="4" stroke-linecap="round"
                          stroke-linejoin="round" fill="none" />
                      </g>
                    </svg>
                    <span> Image </span>
                  </div>
                </button>

                <button class="option" @click="chooseType('document')">
                  <div class="select_file_source_wrapper">
                    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                      <!-- frame -->
                      <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="#FFD700" stroke-width="4" />

                      <!-- paper sheet -->
                      <g transform="translate(10,10)">
                        <rect x="4" y="4" width="28" height="36" rx="4" fill="none" stroke="#FFD700" stroke-width="4" />

                        <path d="M32 4 L40 12 L40 40 L32 40" fill="none" stroke="#FFD700" stroke-width="4"
                          stroke-linejoin="round" />

                        <line x1="10" y1="16" x2="30" y2="16" stroke="#FFD700" stroke-width="4"
                          stroke-linecap="round" />

                        <line x1="10" y1="24" x2="30" y2="24" stroke="#FFD700" stroke-width="4"
                          stroke-linecap="round" />

                        <line x1="10" y1="32" x2="26" y2="32" stroke="#FFD700" stroke-width="4"
                          stroke-linecap="round" />
                      </g>
                    </svg>

                    <span> Document </span>
                  </div>
                </button>
              </div>

              <!-- URL Dialog -->
              <div v-if="Show_Url_Dialog" class="media-dialog style-dialog input">
                <h2>Enter Media URL & Name</h2>
                <div class="custom_media_url_Input">
                  <input type="url" autofocus required v-model.trim="Media_Url"
                    placeholder="https://example.com/file.mp4" />
                  <input type="text" required v-model.trim="Media_Name" placeholder="Name" />
                </div>
                <div class="dialog-buttons">
                  <button class="cancel-btn" @click="cancelDialog">Cancel</button>
                  <button class="apply-btn" @click="applyDialog">Apply</button>
                </div>
              </div>
            </div>

            <!--  -->

            <button @click="menuVisible = !menuVisible; stopEverything()" class="STT_btn" title="Speech to text">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512" fill="none">
                <rect x="26" y="100" width="33" height="76" rx="16.5" fill="#FFD700" />
                <rect x="90" y="36" width="33" height="203" rx="16.5" fill="#FFD700" />
                <rect x="154" y="78" width="33" height="119" rx="16.5" fill="#FFD700" />
                <rect x="218" y="100" width="33" height="76" rx="16.5" fill="#FFD700" />

                <rect x="176" y="355" width="157" height="33" rx="16.5" fill="#FFD700" />

                <path
                  d="M290 95H430C461.3 95 487 120.7 487 152V438C487 469.3 461.3 495 430 495H110C78.7 495 53 469.3 53 438V281"
                  stroke="#FFD700" stroke-width="33" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <button ref="recordAudioButton" @click="AudioRec"
              :title="Is_Audio_Recording ? 'Stop Recording' : 'Record Audio'">
              <svg v-show="Is_Audio_Recording" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"></circle>
                <rect x="9" y="9" width="6" height="6" rx="1" fill="#FFD700"></rect>
              </svg>

              <svg v-show="!Is_Audio_Recording" viewBox="0 0 24 24">
                <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z"></path>
                <path
                  d="M19 11a1 1 0 00-1 1v1a6 6 0 01-12 0v-1a1 1 0 00-2 0v1a8 8 0 008 8 8 8 0 008-8v-1a1 1 0 00-1-1z">
                </path>
              </svg>
            </button>

            <button ref="recordVideoButton" v-show="!Front_Back_Camera" @click="VideoRec"
              :title="Is_Video_Recording ? 'Stop Recording' : 'Record Video'">
              <svg v-show="Is_Video_Recording" style="width: 4vmin !important" xmlns="http://www.w3.org/2000/svg"
                width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"></circle>
                <rect x="9" y="9" width="6" height="6" rx="1" fill="#FFD700"></rect>
              </svg>

              <svg v-show="!Is_Video_Recording" viewBox="0 0 24 24">
                <path
                  d="M17 10.5v-2A2.5 2.5 0 0014.5 6h-9A2.5 2.5 0 003 8.5v7A2.5 2.5 0 005.5 18h9a2.5 2.5 0 002.5-2.5v-2l4 3v-9l-4 3z">
                </path>
              </svg>
            </button>

            <button @click="
              Is_FlashLight_On = !Is_FlashLight_On;
            Toggle_Torch();
            " class="torch" :class="{ Flash_light_not_available: !Is_FlashLight_Supported }"
              ref="flash_light_btn_element" title="Flash Light">
              <!-- 24×24 Lightning Icon (OFF by default) -->
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20">
                <!-- Lightning bolt path -->
                <path :class="[
                  { flash_light_on: Is_FlashLight_On },
                  { Flash_light_not_available: !Is_FlashLight_Supported },
                ]" d="M13 4 L7 14 h4 l-1 6 l7-12 h-4 Z" fill="none" stroke="#FFD700" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <button id="useFrontCamera" v-show="Front_Back_Camera" @click="FrontCamVideoRec" title="Front Camera">
              <svg width="100" height="100" viewBox="0 -2 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                stroke="gold" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="6" width="18" height="12" rx="2" ry="2" stroke="gold" fill="none" />
                <circle cx="12" cy="12" r="3" stroke="gold" />
                <circle cx="18" cy="8" r="1" fill="gold" />
                <rect x="8" y="3" width="8" height="2" rx="1" fill="gold" />
              </svg>
            </button>

            <button id="useBackCamera" v-show="Front_Back_Camera" @click="BackCamVideoRec" title="Back Camera">
              <svg width="24" height="24" viewBox="2 0 20 20" stroke="white" xmlns="http://www.w3.org/2000/svg">
                <!-- Camera Body -->
                <rect x="3" y="4" width="18" height="14" rx="2" stroke="gold" stroke-width="2" />

                <!-- Lens -->
                <circle cx="9" cy="12" r="4" stroke="black" stroke-width="2" />

                <!-- Flash -->
                <circle cx="18" cy="10" r="2.5" fill="black" />
              </svg>
            </button>

            <button v-if="disable_color_notes_switcher_btn" class="toggle_note_color_mode"
              @click="Toggle_Note_Card_Color_Mode" title="Toggle Note Color">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Sticky Note Shape -->
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2" fill="gray" stroke="gold" stroke-width="1.5" />
                <!-- Colorful Half -->
                <path d="M12 4h8v16h-8z" fill="url(#grad1)" stroke="black" stroke-width="1.5" />
                <!-- Toggle Indicator -->
                <circle :class="{
                  color_full_notes_card_active_toggler: Is_Sticky_Colorful_Card,
                }" cx="18" cy="18" r="5" fill="gray" stroke="black" stroke-width="1" />
                <path :class="{
                  color_full_notes_card_active_line: Is_Sticky_Colorful_Card,
                }" d="M16 18h4" stroke="black" stroke-width="1.5" stroke-linecap="round" />
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#FF4500" />
                    <stop offset="50%" stop-color="#FFD700" />
                    <stop offset="100%" stop-color="#00FF00" />
                  </linearGradient>
                </defs>
              </svg>
            </button>

            <button class="MarkDownMenu" title="Toggle Styling Menu" @click=" Toggle_MarkDown_Menu = !Toggle_MarkDown_Menu;
            Front_Back_Camera = false;
            Tiptap_Editor.commands.focus();
            ">
              <svg width="24" height="24" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <!-- Black background with gold border -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Left angled bracket -->
                <path d="M10 8 L5 16 L10 24" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />

                <!-- Right angled bracket -->
                <path d="M22 8 L27 16 L22 24" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />

                <!-- Center "A" -->
                <text x="16" y="20" text-anchor="middle" font-family="Georgia, serif" fill="#FFD700" font-weight="bold">
                  A
                </text>
              </svg>
            </button>
          </div>
        </div>

        <!--  -->
        <div class="delete-modal" id="deleteModal" :class="{ active: toggle_delete_model }">
          <div class="header">
            <h2>Attachments</h2>
            <button class="close-modal" @click="
              toggle_delete_model = false;
            Close_Btn_Sound.play();
            " title="Close_Attachments_Panel">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                class="feather feather-x">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Video Section -->
          <div class="all_media_types_container">
            <div class="section">
              <div class="section-title">Video</div>
              <div class="scrollable">
                <ul class="media-list" v-if="Video_Array.length > 0">
                  <li class="items" :key="index" v-for="(item, index) in Video_Array" :class="{
                    media_and_file_delete_animation: item?.deletion,
                  }">
                    <span>{{ item?.name }}</span>
                    <button class="delete-btn" @click="delete_media(index, 'video')" title="Delete Video">
                      🗑
                    </button>
                  </li>
                </ul>
                <p class="empty-message" v-if="Video_Array.length <= 0">
                  No video files available
                </p>
              </div>
            </div>

            <!-- Audio Section -->
            <div class="section">
              <div class="section-title">Audio</div>
              <div class="scrollable">
                <ul class="recording-list" v-if="Audio_Array.length > 0">
                  <li class="items" :key="index" v-for="(item, index) in Audio_Array" :class="{
                    media_and_file_delete_animation: item?.deletion,
                  }">
                    <span>{{ item?.name }}</span>
                    <button class="delete-btn" @click="delete_media(index, 'audio')" title="Delete Audio">
                      🗑
                    </button>
                  </li>
                </ul>
                <p class="empty-message" v-if="Audio_Array.length <= 0">
                  No audio files available
                </p>
              </div>
            </div>

            <!-- Image Section -->
            <div class="section">
              <div class="section-title">Images</div>
              <div class="scrollable">
                <ul class="file-list" v-if="Image_Array.length > 0">
                  <li class="items" :key="index" v-for="(item, index) in Image_Array"
                    :class="{ media_and_file_delete_animation: item?.deletion }">
                    <span>{{ item?.name }}</span>
                    <button class="delete-btn" @click="delete_media(index, 'image')" title="Delete Image">
                      🗑
                    </button>
                  </li>
                </ul>
                <p class="empty-message" v-if="Image_Array.length <= 0">
                  No image files available
                </p>
              </div>
            </div>

            <!-- Docs Section -->
            <div class="section">
              <div class="section-title">Documents</div>
              <div class="scrollable">
                <ul class="file-list" v-if="Document_Array.length > 0">
                  <li class="items" :key="index" v-for="(item, index) in Document_Array" :class="{
                    media_and_file_delete_animation: item?.deletion,
                  }">
                    <span>{{ item?.name }}</span>
                    <button class="delete-btn" @click="delete_media(index, 'doc')" title="Delete Document">
                      🗑
                    </button>
                  </li>
                </ul>
                <p class="empty-message" v-if="Document_Array.length <= 0">
                  No document files available
                </p>
              </div>
            </div>
          </div>
        </div>
        <!--  -->

        <div class="notes_Writing_Area_Wrapper notes_Writing_Area_Wrapper_mobile_view">
          <input name="Main_Note_Writing_Area" ref="focusOnInput" type="text" class="title editor_title_mobile_view"
            placeholder="Note Title" v-model="CurrentlyWritingTitle" />
          <!-- bubble-menu-small screens -->

          <BubbleMenu v-if="Tiptap_Editor && !Show_prompt_input_dialog" :editor="Tiptap_Editor" placement="top"
            :options="bubbleMenuOptions" :update-delay="0" :should-show="shouldShowBubbleMenu">

            <!-- 2. Create an inner wrapper and put the class HERE -->
            <div class="bubble-menu">
              <div class="bm_btn_wrapper" v-for="(item, idx) in Bubble_Menu" :key="idx">
                <button class="bm-btn" @click="item.action === 'Custom' ? Open_dialog(item) : Modify_By_AI(item)"
                  :class="[{ loader_disable_btn_effects: item.loading }, { mb_stop_btn: item.action === 'Stop' }]">
                  <b :class="{ bm_label_fade: item.loading }">{{ item.action }}</b>
                  <div v-if="item.loading" class="Upload_Loader bubble_menu_btn_loader"> </div>
                </button>
                <div v-if="Bubble_Menu.length - 1 !== idx" class="bm-divider"> </div>
              </div>
            </div>

          </BubbleMenu>


          <!-- AI Status Bar -->
          <div v-if="Is_AI_Edit_Started" class="ai-floating-bar">
            <div class="ai-bar-content">
              <div class="ai-status">
                <span class="ai-dot"></span>
                <span class="ai-text">{{ AI_Generation_Status }}</span>
              </div>

              <button @click="Stop_AI_Generation" class="stop-button">
                ⏹️ Stop
              </button>
            </div>
          </div>


          <!-- OCR Status Bar -->
          <div v-if="OCR_Processing" class="ai-floating-bar">
            <div class="ai-bar-content">
              <div class="ai-status">
                <span class="ai-dot"></span>
                <span class="ai-text">{{ OCR_Status }}</span>
              </div>

              <button @click="Stop_OCR" class="stop-button">
                ⏹️ Stop
              </button>
            </div>
          </div>


          <!-- custom ai prompt input dialog -->
          <div class="prompt-overlay" :class="{ active: Show_prompt_input_dialog }" id="promptOverlay"
            @click="Show_prompt_input_dialog = false; fullyCloseSTT();">
            <div class="prompt-dialog" @click.stop>
              <div class="prompt-dialog-header">
                <label class="prompt-dialog-label" for="promptInput">Prompt</label>

                <div class="prompt_stt_menu">

                  <button class="pill-btn lang-select" @click="toggle_prompt_Dropdown">
                    <span class="flag-icon">{{languages.find(l => l.code === selectedLang)?.flag}}</span>
                    <span class="lang-code">{{ selectedLang.toUpperCase() }}</span>
                  </button>

                  <div v-if="Is_prompt_dropdown_open" :class="{ active: Is_prompt_dropdown_animate }"
                    class="stt-dropdown-list prompt_dropdown">
                    <div v-for="lang in languages.sort((a, b) => a.name.localeCompare(b.name))" :key="lang.code"
                      class="drop-item" @click="selectLanguage(lang, 'prompt')">
                      <span class="drop-flag">{{ lang.flag }}</span> <span> {{ lang.name }}</span>
                    </div>
                  </div>

                </div>

              </div>

              <textarea v-model.trim="prompt_input" ref="prompt_dialog_input_ref" id="promptInput"
                class="prompt-dialog-input" placeholder="Write instructions to change selected content…"
                rows="3"></textarea>

              <div class="prompt-dialog-actions">

                <button class="pill-btn mic-action prompt_mic"
                  :class="[status.toLowerCase(), { 'is-active': isRecording }]" @click="handleMicTapped('prompt')">
                  <div v-if="status === 'Connecting'" class="spinner"></div>

                  <svg v-else-if="isRecording" class="prompt_pill_icon" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                  </svg>

                  <svg v-else class="prompt_pill_icon" viewBox="0 0 24 24">
                    <path
                      d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                      fill="currentColor" />
                  </svg>

                  <div v-if="isRecording" class="ripple-ring"></div>
                </button>

                <div class="prompt_dialog_actions_btns">
                  <button class="prompt-btn prompt-btn--cancel"
                    @click="Show_prompt_input_dialog = false; fully_close_prompt_STT();">Cancel</button>
                  <button class="prompt-btn prompt-btn--apply" @click="applyPrompt">Apply</button>
                </div>
              </div>

            </div>
          </div>


          <!-- STT Menu -->

          <div :class="{ active: menuVisible }" class="stt-pill-wrapper">

            <div v-if="isDropdownOpen" :class="{ active: isDropdownAnimation }" class="stt-dropdown-list">
              <div v-for="lang in languages.sort((a, b) => a.name.localeCompare(b.name))" :key="lang.code"
                class="drop-item" @click="selectLanguage(lang)">
                <span class="drop-flag">{{ lang.flag }}</span> <span> {{ lang.name }}</span>
              </div>
            </div>

            <div class="stt-pill-main" :class="{ 'error-border': status === 'Error' }">

              <button class="pill-btn lang-select" @click="toggleDropdown">
                <span class="flag-icon">{{languages.find(l => l.code === selectedLang)?.flag}}</span>
                <span class="lang-code">{{ selectedLang.toUpperCase() }}</span>
              </button>

              <div class="pill-divider"></div>

              <button class="pill-btn mic-action" :class="[status.toLowerCase(), { 'is-active': isRecording }]"
                @click="handleMicTapped">
                <div v-if="status === 'Connecting'" class="spinner"></div>

                <svg v-else-if="isRecording" class="pill-icon" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                </svg>

                <svg v-else class="pill-icon" viewBox="0 0 24 24">
                  <path
                    d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                    fill="currentColor" />
                </svg>

                <div v-if="isRecording" class="ripple-ring"></div>
              </button>

              <div class="pill-divider"></div>

              <button class="pill-btn close-x" @click="fullyCloseSTT">
                <svg class="pill-icon-small" viewBox="0 0 24 24">
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>


          <!-- TTS Menu -->
          <div class="tts-shell" :class="{ active: Show_TTS_Player }" id="ttsShell">
            <div class="tts-menu" id="ttsMenu">

              <div class="tts-left">
                <div class="tts-wave">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9
                   C4.2 6.8 5.3 6.8 6.5 9
                   C7.7 11.2 8.8 11.2 10 9
                   C11.2 6.8 12.3 6.8 13.5 9
                   C14.7 11.2 15.8 11.2 17 9
                   C18.2 6.8 19.3 6.8 20.5 9" stroke="#efc248" stroke-width="1.9" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path d="M3 15
                   C4.2 12.8 5.3 12.8 6.5 15
                   C7.7 17.2 8.8 17.2 10 15
                   C11.2 12.8 12.3 12.8 13.5 15
                   C14.7 17.2 15.8 17.2 17 15
                   C18.2 12.8 19.3 12.8 20.5 15" stroke="#efc248" stroke-width="1.9" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </div>

                <div class="tts-meta">
                  <div class="tts-time">{{ currentTimeDisplay }}</div>
                </div>
              </div>

              <div class="tts-divider"></div>

              <div class="tts-controls">

                <button @click="seek(-10)" class="tts-btn" aria-label="Back 10 seconds">
                  <svg class="tts-step-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(-10,-15)">
                      <path d="M30 25 A16 16 0 1 1 18 38" stroke="currentColor" stroke-width="3.8"
                        stroke-linecap="round" />
                    </g>
                    <g transform="translate(5,-6)">
                      <path d="M18 10 L10 16 L18 22" stroke="currentColor" stroke-width="3.8" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </g>
                    <text x="22.5" y="30" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor"
                      font-family="Segoe UI, sans-serif">10</text>
                  </svg>
                </button>

                <button @click="togglePause" class="tts-btn primary" aria-label="Play">

                  <!-- Play -->
                  <svg v-if="!isPlaying" class="tts-play-icon" viewBox="0 0 24 24" fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5.5
                   C8 4.7 8.9 4.2 9.6 4.7
                   L18 10.3
                   C18.7 10.8 18.7 12 18 12.5
                   L9.6 18.1
                   C8.9 18.6 8 18.1 8 17.3
                   Z" />
                  </svg>

                  <!-- Pause -->
                  <svg v-else class="tts-pause-icon" viewBox="0 0 24 24" fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="5.5" width="3.5" height="13" rx="0.8" />
                    <rect x="14.5" y="5.5" width="3.5" height="13" rx="0.8" />
                  </svg>

                </button>

                <button @click="seek(10)" class="tts-btn" aria-label="Forward 10 seconds">
                  <svg class="tts-step-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(10,-16)">
                      <path d="M18 26 A16 16 0 1 0 30 38" stroke="currentColor" stroke-width="3.8"
                        stroke-linecap="round" />
                    </g>
                    <g transform="translate(-5,-6)">
                      <path d="M30 10 L38 16 L30 22" stroke="currentColor" stroke-width="3.8" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </g>
                    <text x="23" y="29" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor"
                      font-family="Segoe UI, sans-serif">10</text>
                  </svg>
                </button>

                <div class="tts-speed" id="speedWrap">
                  <button @click="Toggle_Playback_dropdown = !Toggle_Playback_dropdown" class="tts-btn tts-speed-btn"
                    id="speedBtn" aria-label="Playback speed">
                    <span class="tts-speed-text" id="speedText">{{ playbackRate }}x</span>
                  </button>

                  <div class="tts-speed-menu" :class="{ active: Toggle_Playback_dropdown }" id="speedMenu">
                    <button @click="playbackRate = item.speed; Toggle_Playback_dropdown = false"
                      v-for="(item, idx) in playbackRate_Speeds" :key="idx" class="tts-speed-option">{{ item.msg
                      }}</button>
                  </div>
                </div>

                <button @click="stopEverything" class="tts-btn tts-close" id="closeTTS" aria-label="Close">
                  <svg class="tts-close-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6L18 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
                    <path d="M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
                  </svg>
                </button>
              </div>

            </div>
          </div>




          <!-- EDITOR ELEMENT -->
          <EditorContent class="tiptap_editor_div_wrapper" name="notewriting" ref="editor" :editor="Tiptap_Editor">
          </EditorContent>

          <div :class="{ 'Show_Paste_Processing_Loader': Paste_Procssing }"
            class="Upload_Loader Upload_Loader_active_media'">
          </div>

          <video class="vid" alt="overlay_displaying_recording_of_live_video" ref="videoPreview" autoplay muted></video>
        </div>

        <!-- Overlay for Audio Recording -->
        <div id="overlay" ref="overlayElement">
          <div class="sound-bars">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>

        <div class="note_create_edit_model_btns_container">

          <div :class="{
            Load_All_Notes_Container_Show_override_position: Attachment_Capacity_Violation_Toggle_Message,
          }" class="Load_All_Notes_Container override_Load_All_Notes_Container_position">
            <h3 ref="Note_Attachment_Limit_Warning_Message" style="color: #1b1b1b">
              ✨ Not Enough Capacity Left! ✨
            </h3>
            <button @click="Attachment_Capacity_Violation_Toggle_Message = false"
              class="Load_All_Notes_Container_Close_Btn" title="Close Attachment Capacity Violation Message">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="edit_create_done_close_btn">
          </div>
        </div>
      </dialog>

      <!-- Desktop View Editor Create Edit UI-->
      <dialog v-if="!Toggle_Mobile_View" open="" ref="Note_Making_UI_Element" class="dialog">
        <div class="create_edit_model_header">
          <h3 ref="Note_heading_element" class="model_h3">Create Note</h3>

          <div ref="Styling_Btns_Toolbar" class="attachmentBtns MarkDownMenu"
            v-show="Toggle_MarkDown_Menu && !Toggle_Table_Menu">
            <!-- /// -->
            <div class="Styling_Btn_Container">

              <button ref="HeadingBtn" title="Heading" :class="{ 'Active_btn': isActive('heading') }"
                @click=" isActive('heading') ? commands.toggleHeading_off() : (Toggle_Heading = !Toggle_Heading, Settings_Style_Btns_Drop_Down_Menus($event, 'Simple_DropDown')); Tiptap_Editor.commands.focus();">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <!-- Rounded black background with gold border -->
                  <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700"
                    stroke-width="2" />
                  <!-- Centered text for heading -->
                  <text x="16" y="22" text-anchor="middle" font-family="Georgia" fill="#FFD700" font-weight="bold">
                    {{ currentHeading ? 'H' + currentHeading : 'H' }}
                  </text>
                </svg>
              </button>

              <div class="Styling_Btn_Levels" :class="{ Show_Styling_Btn_level: Toggle_Heading }">
                <button @click="commands.toggleHeading(1); Toggle_Heading = false">H1</button>
                <button @click="commands.toggleHeading(2); Toggle_Heading = false">H2</button>
                <button @click="commands.toggleHeading(3); Toggle_Heading = false">H3</button>
                <button @click="commands.toggleHeading(4); Toggle_Heading = false">H4</button>
                <button @click="commands.toggleHeading(5); Toggle_Heading = false">H5</button>
                <button @click="commands.toggleHeading(6); Toggle_Heading = false">H6</button>
              </div>

            </div>

            <button ref="BoldBtn" title="Bold" @click="commands.toggleBold" :class="{ 'Active_btn': isActive('bold') }">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <!-- Background -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />
                <!-- Bold letter -->
                <text x="16" y="22" text-anchor="middle" font-family="Georgia" fill="#FFD700" font-weight="bold">
                  B
                </text>
              </svg>
            </button>

            <!-- Font Size Button -->
            <div class="Styling_Btn_Container">

              <button ref="Font_Size_Btn" title="Font Size" :class="{ 'Active_btn': isFontSizeActive }"
                @click="isFontSizeActive ? commands.unsetFontSize() : (Toggle_Font_Size = !Toggle_Font_Size, Settings_Style_Btns_Drop_Down_Menus($event, 'Simple_DropDown')); Tiptap_Editor.commands.focus();">
                <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                  style="display: block">
                  <!-- Rounded square container -->
                  <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <g v-if="!currentFontSize">
                    <!-- Stylized A -->
                    <path d="M5 16.7L9.5 6.5L13.5 16.5" fill="none" stroke="#FFD700" stroke-width="1.5"
                      stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M8 12.5h3.6" fill="none" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" />

                    <g transform="translate(1 0)">
                      <path d="M17 7v10" fill="none" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" />
                      <path d="M15.5 8.5L17 7l1.5 1.5" fill="none" stroke="#FFD700" stroke-width="1.5"
                        stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M15.5 15.5L17 17l1.5-1.5" fill="none" stroke="#FFD700" stroke-width="1.5"
                        stroke-linecap="round" stroke-linejoin="round" />
                    </g>
                  </g>
                  <g v-else transform="scale(0.9)">
                    <text x="13" y="19" text-anchor="middle" font-family="Georgia" fill="#FFD700" font-weight="bold">
                      {{ currentFontSize.slice(0, -2) }}
                    </text>
                  </g>
                </svg>
              </button>

              <div class="Styling_Btn_Levels" :class="{ Show_Styling_Btn_level: Toggle_Font_Size }">
                <button @click="commands.setFontSize('8px'); Toggle_Font_Size = false">8</button>
                <button @click="commands.setFontSize('10px'); Toggle_Font_Size = false">10</button>
                <button @click="commands.setFontSize('12px'); Toggle_Font_Size = false">12</button>
                <button @click="commands.setFontSize('14px'); Toggle_Font_Size = false">14</button>
                <button @click="commands.setFontSize('16px'); Toggle_Font_Size = false">16</button>
                <button @click="commands.setFontSize('18px'); Toggle_Font_Size = false">18</button>
                <button @click="commands.setFontSize('20px'); Toggle_Font_Size = false">20</button>
                <button @click="commands.setFontSize('24px'); Toggle_Font_Size = false">24</button>
                <button @click="commands.setFontSize('28px'); Toggle_Font_Size = false">28</button>
                <button @click="commands.setFontSize('32px'); Toggle_Font_Size = false">32</button>
                <button @click="commands.setFontSize('34px'); Toggle_Font_Size = false">34</button>
                <button @click="commands.setFontSize('36px'); Toggle_Font_Size = false">36</button>
                <button @click="commands.setFontSize('38px'); Toggle_Font_Size = false">38</button>
                <button @click="commands.setFontSize('40px'); Toggle_Font_Size = false">40</button>
                <button @click="commands.setFontSize('42px'); Toggle_Font_Size = false">42</button>
                <button @click="commands.setFontSize('44px'); Toggle_Font_Size = false">44</button>
                <button @click="commands.setFontSize('46px'); Toggle_Font_Size = false">46</button>
                <button @click="commands.setFontSize('48px'); Toggle_Font_Size = false">48</button>
                <button @click="commands.setFontSize('50px'); Toggle_Font_Size = false">50</button>

              </div>

            </div>

            <!-- Spacing Button -->
            <div class="Styling_Btn_Container">

              <button ref="Line_Spacing_Btn" title="Line Spacing" :class="{ 'Active_btn': isLineHeightActive }"
                @click="isLineHeightActive ? commands.unsetLineHeight() : (Toggle_Line_Spacing = !Toggle_Line_Spacing, Settings_Style_Btns_Drop_Down_Menus($event, 'Simple_DropDown')); Tiptap_Editor.commands.focus();">
                <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                  style="display: block">
                  <!-- Rounded square container -->
                  <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <g v-if="!isLineHeightActive">
                    <!-- Mid text line (slightly LEFT) -->
                    <path d="M5.5 12h8" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />

                    <!-- Line-height indicator with arrows (much taller, slightly RIGHT) -->
                    <g transform="translate(1 0)">
                      <!-- vertical shaft (much longer) -->
                      <path d="M17 6.8v10.4" fill="none" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" />

                      <!-- up arrow (higher) -->
                      <path d="M15.8 8L17 6.8l1.2 1.2" fill="none" stroke="#FFD700" stroke-width="1.8"
                        stroke-linecap="round" stroke-linejoin="round" />

                      <!-- down arrow (lower) -->
                      <path d="M15.8 15.6L17 17.2l1.2-1.2" fill="none" stroke="#FFD700" stroke-width="1.8"
                        stroke-linecap="round" stroke-linejoin="round" />
                    </g>
                  </g>
                  <g v-else transform="scale(0.6)">
                    <text x="20" y="24" text-anchor="middle" font-family="Georgia" fill="#FFD700" font-weight="bold">
                      {{ currentLineHeight }}
                    </text>
                  </g>
                </svg>
              </button>

              <div class="Styling_Btn_Levels" :class="{ Show_Styling_Btn_level: Toggle_Line_Spacing }">
                <button @click="commands.setLineHeight(1.75); Toggle_Line_Spacing = false">1.75</button>
                <button @click="commands.setLineHeight(2); Toggle_Line_Spacing = false">2</button>
                <button @click="commands.setLineHeight(2.25); Toggle_Line_Spacing = false">2.25</button>
                <button @click="commands.setLineHeight(2.5); Toggle_Line_Spacing = false">2.5</button>
                <button @click="commands.setLineHeight(2.75); Toggle_Line_Spacing = false">2.75</button>
                <button @click="commands.setLineHeight(3); Toggle_Line_Spacing = false">3</button>
                <button @click="commands.setLineHeight(3.25); Toggle_Line_Spacing = false">3.25</button>
                <button @click="commands.setLineHeight(3.5); Toggle_Line_Spacing = false">3.5</button>
                <button @click="commands.setLineHeight(3.75); Toggle_Line_Spacing = false">3.75</button>
                <button @click="commands.setLineHeight(4); Toggle_Line_Spacing = false">4</button>
                <button @click="commands.setLineHeight(6); Toggle_Line_Spacing = false">6</button>
                <button @click="commands.setLineHeight(8); Toggle_Line_Spacing = false">8</button>
                <button @click="commands.setLineHeight(10); Toggle_Line_Spacing = false">10</button>

              </div>

            </div>



            <!-- Spacing Button -->
            <button title="Insert Line" @click="commands.insertHR()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display: block">
                <!-- Rounded square container -->
                <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Text lines -->
                <path d="M6 12h12M6 " fill="none" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round" />
              </svg>
            </button>

            <button ref="ItalicBtn" title="Italic" @click="commands.toggleItalic"
              :class="{ 'Active_btn': isActive('italic') }">
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <!-- Background -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Bold italic I with connected caps -->
                <g transform="skewX(-12) translate(4,0)">
                  <!-- vertical stem (slightly taller to touch bottom cap) -->
                  <rect x="14.5" y="9" width="3" height="14.5" fill="#FFD700" rx="1" />
                  <!-- top cap -->
                  <rect x="13.5" y="8" width="5" height="1.5" fill="#FFD700" rx="0.75" />
                  <!-- bottom cap (flush with skewed stem) -->
                  <rect x="13.5" y="23" width="5" height="1.5" fill="#FFD700" rx="0.75" />
                </g>
              </svg>
            </button>

            <button ref="CodeBtn" title="Code" :class="{ 'Active_btn': isActive('codeBlock') }"
              @click="commands.toggleCodeBlock()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display: block">
                <!-- Rounded square container -->
                <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Curly braces in gold -->
                <path d="M9 8c-1 1-1 2.5-1 4s0 3 1 4" fill="none" stroke="#FFD700" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
                <path d="M15 16c1-1 1-2.5 1-4s0-3-1-4" fill="none" stroke="#FFD700" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <button title="Inline Code" @click="commands.toggleInlineCode()"
              :class="{ 'Active_btn': isActive('code') }">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display: block">
                <!-- Rounded square container -->
                <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Left angle bracket -->
                <path d="M10 8 L7 12 L10 16" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />

                <!-- Right angle bracket -->
                <path d="M14 8 L17 12 L14 16" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />

                <!-- Inline code indicator (small horizontal bar) -->
                <path d="M9.5 18h5" fill="none" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </button>


            <!-- Text Alignment -->
            <div class="Styling_Btn_Container">

              <button ref="Text_Alignment_Btn" title="Text Alignment" :class="{ 'Active_btn': isTextAlignActive }"
                @click="isTextAlignActive ? commands.unsetTextAlign() : (Toggle_Text_Alignment = !Toggle_Text_Alignment, Settings_Style_Btns_Drop_Down_Menus($event, 'Simple_DropDown')); Tiptap_Editor.commands.focus();">
                <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                  style="display: block">
                  <!-- Rounded square container -->
                  <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <!-- Left-aligned text lines -->
                  <g v-if="!isTextAlignActive">
                    <path d="M6 8h10" fill="none" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" />
                    <path d="M6 12h7" fill="none" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" />
                    <path d="M6 16h9" fill="none" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" />
                  </g>
                  <g v-else transform="scale(0.9)">
                    <text x="14" y="19" text-anchor="middle" font-family="Georgia" fill="#FFD700" font-weight="bold">
                      {{ currentTextAlign.slice(0, 1).toUpperCase() }}
                    </text>
                  </g>
                </svg>
              </button>

              <div class="Styling_Btn_Levels"
                :class="[Toggle_Text_Alignment ? 'Show_Styling_Btn_level TextAlign_Styling_Btn_Levels' : '']">
                <button title="Left Alignment" @click="commands.setTextAlign('left'); Toggle_Text_Alignment = false">
                  <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                      stroke-width="2" />

                    <path d="M6 8h10M6 12h7M6 16h10" fill="none" stroke="#FFD700" stroke-width="2"
                      stroke-linecap="round" />
                  </svg>
                </button>

                <button title="Right Alignment" @click="commands.setTextAlign('right'); Toggle_Text_Alignment = false">
                  <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                      stroke-width="2" />

                    <path d="M8 8h10M11 12h7M8 16h10" fill="none" stroke="#FFD700" stroke-width="2"
                      stroke-linecap="round" />
                  </svg>
                </button>

                <button title="Center Alignment"
                  @click="commands.setTextAlign('center'); Toggle_Text_Alignment = false">
                  <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                      stroke-width="2" />

                    <path d="M7 8h10M9 12h6M7 16h10" fill="none" stroke="#FFD700" stroke-width="2"
                      stroke-linecap="round" />
                  </svg>
                </button>


                <button title="Justify Alignment"
                  @click="commands.setTextAlign('justify'); Toggle_Text_Alignment = false">
                  <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                      stroke-width="2" />

                    <path d="M6 8h12M6 12h12M6 16h12" fill="none" stroke="#FFD700" stroke-width="2"
                      stroke-linecap="round" />
                  </svg>
                </button>

              </div>

            </div>


            <!-- link btn -->
            <div class="Styling_Btn_Container">

              <button ref="Link_Btn" title="Link"
                @click="isActive('link') ? commands.unsetLink() : (Toggle_link = !Toggle_link, Settings_Style_Btns_Drop_Down_Menus($event)); Tiptap_Editor.commands.focus();"
                :class="{ Active_btn: isActive('link') }">
                <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                  style="display: block">
                  <!-- Rounded square container -->
                  <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <!-- Larger chain link: two ovals -->
                  <!-- Left oval -->
                  <path d="M4 12c0-2 1.6-3.5 3.5-3.5h2c2 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5h-2c-2 0-3.5-1.6-3.5-3.5z"
                    fill="none" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  <!-- Right oval -->
                  <path d="M11.5 12c0-2 1.6-3.5 3.5-3.5h2c2 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5h-2c-2 0-3.5-1.6-3.5-3.5z"
                    fill="none" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>

              <div style="width: auto;" class="Styling_Btn_Levels"
                :class="[Toggle_link ? 'Show_Styling_Btn_level link_Styling_Btn_Levels' : '']">

                <input class="title link_input" autofocus v-model="link.url" ref="LinkInputElement" type="text"
                  placeholder="Enter URL..." @keyup.enter="Apply_Link" />
                <div class="link_input_btns">
                  <button @click="Apply_Link">Apply</button>
                  <button @click="Toggle_link = false">Cancel</button>
                </div>


              </div>

            </div>


            <button title="Under Line" @click="commands.toggleUnderline();"
              :class="{ 'Active_btn': isActive('underline') }">
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <!-- Background rectangle -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Icon scaled + centered -->
                <g transform="translate(4.5,6.5) scale(1.4)">
                  <path fill="#FFD700" stroke="#FFD700" stroke-width="0.6"
                    d="M5.5 1a.5.5 0 0 1 .5.5v5a2.5 2.5 0 0 0 5 0v-5a.5.5 0 0 1 1 0v5a3.5 3.5 0 0 1-7 0v-5a.5.5 0 0 1 .5-.5z" />
                  <path fill="#FFD700" stroke="#FFD700" stroke-width="0.6"
                    d="M2.5 11.3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11z" />
                </g>
              </svg>
            </button>

            <button title="Strike" @click="commands.toggleStrike();" :class="{ 'Active_btn': isActive('strike') }">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <!-- Background -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Scaled + centered S -->
                <path
                  d="M22.9 4.3c-2.4-1.5-5.3-2.3-8.5-2.3C7.2 2 2 6.1 2 11.4c0 3.7 2.6 6.4 7.7 7.9l4.1 1.2c2.9.8 4.3 2 4.3 3.8 0 2.4-2.4 4-6.2 4-3.1 0-5.7-.9-8.1-2.7l-2.4 3.4c2.9 2.2 6.7 3.4 10.7 3.4 7 0 11.8-3.6 11.8-9.2 0-4.2-2.6-7-7.9-8.6l-4.3-1.3c-2.7-.8-4-1.9-4-3.6 0-2.2 2.1-3.7 5.4-3.7 2.8 0 5.2.7 7.3 2.1l2.3-3.4z"
                  fill="#FFD700" transform="translate(10,7.5) scale(0.45)" />

                <!-- Strike-through -->
                <line x1="8" y1="16" x2="24" y2="16" stroke="#FFD700" stroke-width="2.5" />
              </svg>
            </button>

            <button title="Checkbox" @click="commands.toggleTaskList();"
              :class="{ 'Active_btn': isActive('taskList') }">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
                <g transform="translate(12 12) scale(1.2) translate(-12 -12)">
                  <!-- Outer box -->
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="#FFD700" stroke-width="1.5" fill="none" />
                  <!-- Checkmark -->
                  <path d="M7 12l4 4 6-8" stroke="#FFD700" stroke-width="2" fill="none" stroke-linecap="round"
                    stroke-linejoin="round" />
                </g>
              </svg>
            </button>


            <div class="Styling_Btn_Container">
              <button ref="Font_Color_Btn" title="Font Color"
                @click="Is_Font_Color_Active ? (Toggle_Font_Color ? Toggle_Font_Color = false : commands.unsetColor()) : (Toggle_Font_Color = !Toggle_Font_Color, Settings_Style_Btns_Drop_Down_Menus($event)); Tiptap_Editor.commands.focus();"
                :class="{ Active_btn: Is_Font_Color_Active }">
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <!-- Black background with gold border -->
                  <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <!-- Large "A" in gold -->
                  <text x="16" y="21.5" text-anchor="middle" font-family="Georgia" font-weight="bold" fill="#FFD700">
                    A
                  </text>
                  <!-- Gold paint droplet to indicate color -->
                  <!-- You can tweak the path for a different droplet shape -->
                  <path d="M22 11 
                             c0 2 -3 3 -3 6 
                             s1.5 4 3 4 
                             s3 -1.5 3 -4 
                             s-3 -4 -3 -6z" fill="#FFD700" />
                </svg>
              </button>

              <div style="width: auto;" class="Styling_Btn_Levels"
                :class="[Toggle_Font_Color ? 'Show_Styling_Btn_level link_Styling_Btn_Levels' : '']">

                <div class="Color_Picker_Container">
                  <input @input="Update_Color_Picker_Preview('font')" ref="Font_Color_Picker_El" type="color"
                    class="colorPicker">
                  <div ref="Font_Color_Preview_El" class="preview"
                    @click="Apply_Color_To_Selected_Element('font'); Toggle_Font_Color = false">
                  </div>
                </div>
                <div class="Opacity_Slider_Container">
                  <label for="opacitySlider">Opacity:</label>
                  <input @input="Update_Color_Picker_Preview('font')" ref="Font_Color_Opacity_Slider_El" type="range"
                    id="opacitySlider" min="0" max="100" value="100">
                </div>


              </div>

            </div>



            <div class="Styling_Btn_Container">
              <button ref="Font_Highlight_Btn" title="Highlight Color"
                @click="isActive('highlight') ? (Toggle_Highlight_Color ? Toggle_Highlight_Color = false : commands.unsetHighlight()) : (Toggle_Highlight_Color = !Toggle_Highlight_Color, Settings_Style_Btns_Drop_Down_Menus($event)); Tiptap_Editor.commands.focus();"
                :class="{ Active_btn: isActive('highlight') }">
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <!-- Black background with gold border -->
                  <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <!-- Gold highlight rectangle behind the "A" -->
                  <rect x="8" y="9" width="16" height="14" fill="#FFD700" />

                  <!-- Large "A" in gold -->
                  <text x="16" y="21" text-anchor="middle" font-family="Georgia" font-weight="bold" fill="black">
                    A
                  </text>
                </svg>
              </button>

              <div style="width: auto;" class="Styling_Btn_Levels"
                :class="[Toggle_Highlight_Color ? 'Show_Styling_Btn_level link_Styling_Btn_Levels' : '']">

                <div class="Color_Picker_Container">
                  <input @input="Update_Color_Picker_Preview('highlight')" ref="Highlight_Color_Picker_El" type="color"
                    class="colorPicker">
                  <div ref="Highlight_Color_Preview_El" class="preview"
                    @click="Apply_Color_To_Selected_Element('highlight'); Toggle_Highlight_Color = false"></div>
                </div>
                <div class="Opacity_Slider_Container">
                  <label for="opacitySlider">Opacity:</label>
                  <input @input="Update_Color_Picker_Preview('highlight')" ref="Highlight_Color_Opacity_Slider_El"
                    type="range" id="opacitySlider" min="0" max="100" value="100">
                </div>

              </div>

            </div>



            <button title="Bullet Points" @click="commands.toggleBulletList();"
              :class="{ 'Active_btn': isActive('bulletList') }">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <!-- Background -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />
                <!-- Three bullet points with horizontal lines -->
                <circle cx="10" cy="10" r="2" fill="#FFD700" />
                <line x1="14" y1="10" x2="26" y2="10" stroke="#FFD700" stroke-width="2" />
                <circle cx="10" cy="16" r="2" fill="#FFD700" />
                <line x1="14" y1="16" x2="26" y2="16" stroke="#FFD700" stroke-width="2" />
                <circle cx="10" cy="22" r="2" fill="#FFD700" />
                <line x1="14" y1="22" x2="26" y2="22" stroke="#FFD700" stroke-width="2" />
              </svg>
            </button>

            <button title="Numer Wise" @click="commands.toggleOrderedList();"
              :class="{ 'Active_btn': isActive('orderedList') }">
              <svg width="32" height="32" viewBox="0 0 32 32">
                <!-- Background -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />
                <g font-weight="bolder">
                  <text x="6" y="11" font-family="Georgia" font-size="10" fill="#FFD700">
                    1
                  </text>
                  <text x="6" y="20" font-family="Georgia" font-size="10" fill="#FFD700">
                    2
                  </text>
                  <text x="6" y="29" font-family="Georgia" font-size="10" fill="#FFD700">
                    3
                  </text>
                </g>
                <!-- Corresponding horizontal lines for list items -->
                <line x1="14" y1="8" x2="26" y2="8" stroke="#FFD700" stroke-width="2" />
                <line x1="14" y1="16.5" x2="26" y2="16.5" stroke="#FFD700" stroke-width="2" />
                <line x1="14" y1="25" x2="26" y2="25" stroke="#FFD700" stroke-width="2" />
              </svg>
            </button>



            <div class="Styling_Btn_Container">
              <button ref="Block_BG_Color_Btn" title="Change Block Background Color"
                @click="Is_Block_Background_Color_Active ? (Toggle_Block_Background_Color ? Toggle_Block_Background_Color = false : commands.toggle_block_bg()) : (Toggle_Block_Background_Color = !Toggle_Block_Background_Color, Settings_Style_Btns_Drop_Down_Menus($event)); Tiptap_Editor.commands.focus();"
                :class="{ Active_btn: Is_Block_Background_Color_Active }">
                <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                  style="display: block">
                  <!-- Container -->
                  <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <!-- Background bar -->
                  <rect x="4" y="8" width="16" height="6" rx="2" fill="#FFD700" opacity="0.8" />

                  <!-- Paragraph text lines -->
                  <path d="M4 6h16" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M4 16h16" stroke="#FFD700" stroke-width="1.8" stroke-linecap="round" />
                </svg>
              </button>

              <div style="width: auto;" class="Styling_Btn_Levels"
                :class="[Toggle_Block_Background_Color ? 'Show_Styling_Btn_level link_Styling_Btn_Levels' : '']">

                <div class="Color_Picker_Container">
                  <input @input="Update_Color_Picker_Preview('block_bg')" ref="Block_BG_Color_Picker_El" type="color"
                    class="colorPicker">
                  <div ref="Block_BG_Color_Preview_El" class="preview"
                    @click="Apply_Color_To_Selected_Element('block_bg'); Toggle_Block_Background_Color = false">
                  </div>
                </div>
                <div class="Opacity_Slider_Container">
                  <label for="opacitySlider">Opacity:</label>
                  <input @input="Update_Color_Picker_Preview('block_bg')" ref="Block_BG_Color_Opacity_Slider_El"
                    type="range" id="opacitySlider" min="0" max="100" value="100">
                </div>

              </div>

            </div>


            <button title="Quote" @click="commands.toggleBlockquote();"
              :class="{ 'Active_btn': isActive('blockquote') }">
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <!-- Background rectangle -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Scaled + centered icon -->
                <g transform="translate(3,2.5) scale(1.65)" fill="#FFD700" stroke="#FFD700" stroke-width="0.5">
                  <path
                    d="M2.5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm5 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6zm0 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6zm-5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm.79-5.373c.112-.078.26-.17.444-.275L3.524 6c-.122.074-.272.17-.452.287-.18.117-.35.26-.51.428a2.425 2.425 0 0 0-.398.562c-.11.207-.164.438-.164.692 0 .36.072.65.217.873.144.219.385.328.72.328.215 0 .383-.07.504-.211a.697.697 0 0 0 .188-.463c0-.23-.07-.404-.211-.521-.137-.121-.326-.182-.568-.182h-.282c.024-.203.065-.37.123-.498a1.38 1.38 0 0 1 .252-.37 1.94 1.94 0 0 1 .346-.298zm2.167 0c.113-.078.262-.17.445-.275L5.692 6c-.122.074-.272.17-.452.287-.18.117-.35.26-.51.428a2.425 2.425 0 0 0-.398.562c-.11.207-.164.438-.164.692 0 .36.072.65.217.873.144.219.385.328.72.328.215 0 .383-.07.504-.211a.697.697 0 0 0 .188-.463c0-.23-.07-.404-.211-.521-.137-.121-.326-.182-.568-.182h-.282a1.75 1.75 0 0 1 .118-.492c.058-.13.144-.254.257-.375a1.94 1.94 0 0 1 .346-.3z" />
                </g>
              </svg>
            </button>

            <button title="Hard Break" @click="commands.insertHardBreak();"
              :class="{ 'Active_btn': isActive('hardBreak') }">
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <!-- Outer container -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Top text line -->
                <line x1="7" y1="11" x2="19" y2="11" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />

                <!-- Bottom text line -->
                <line x1="7" y1="21" x2="19" y2="21" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />

                <!-- Forced break indicator (vertical bar) -->
                <line x1="22" y1="9" x2="22" y2="19" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />

                <!-- Down arrow (hard action) -->
                <path d="M22 19l-3-3m3 3l3-3" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>

            <div class="Styling_Btn_Container">

              <button ref="Table_Btn" title="Table"
                @click="isActive('table') ? (commands.deleteTable(), Toggle_Table = false) : (Toggle_Table = !Toggle_Table, Settings_Style_Btns_Drop_Down_Menus($event)); Tiptap_Editor.commands.focus();"
                :class="{ Active_btn: isActive('table') }">
                <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                  style="display: block">
                  <!-- Rounded square container -->
                  <rect x="1" y="1" width="22" height="22" rx="4" ry="4" fill="none" stroke="#FFD700"
                    stroke-width="2" />

                  <!-- Table outer border -->
                  <rect x="6" y="6" width="12" height="12" rx="1" ry="1" fill="none" stroke="#FFD700"
                    stroke-width="1.8" />

                  <!-- Vertical grid lines -->
                  <path d="M10 6v12M14 6v12" fill="none" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round" />

                  <!-- Horizontal grid lines -->
                  <path d="M6 10h12M6 14h12" fill="none" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round" />
                </svg>
              </button>


              <div style="width: auto;" class="Styling_Btn_Levels"
                :class="[Toggle_Table ? 'Show_Styling_Btn_level link_Styling_Btn_Levels' : '']">

                <div class="table_input_container">
                  <input class="title link_input" autofocus v-model="Table_Input.columns" type="number"
                    placeholder="Row" @keyup.enter="$event.target.nextElementSibling.focus()" />

                  <input class="title link_input" autofocus v-model="Table_Input.rows" type="number" placeholder="Col"
                    @keyup.enter="Table_Input.rows > 0 && Table_Input.columns > 0 ? Table_Input.rows <= 50 && Table_Input.columns <= 50 ? (commands.insertTable(Table_Input.rows, Table_Input.columns), Toggle_Table = false) : Show_Create_Edit_Model_Warning('❌ More than 50 rows and columns not allowed.', 2000) : Show_Create_Edit_Model_Warning('❌ Invalid Input.', 2000)" />
                </div>


                <div class="link_input_btns">
                  <button
                    @click="Table_Input.rows > 0 && Table_Input.columns > 0 ? Table_Input.rows <= 50 && Table_Input.columns <= 50 ? (commands.insertTable(Table_Input.rows, Table_Input.columns), Toggle_Table = false) : Show_Create_Edit_Model_Warning('❌ More than 50 rows and columns not allowed.', 2000) : Show_Create_Edit_Model_Warning('❌ Invalid Input.', 2000)">Apply</button>
                  <button @click="Toggle_Table = false; Tiptap_Editor.commands.focus();">Cancel</button>
                </div>


              </div>

            </div>


            <button @click="commands.clearInlineStyles">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <!-- Rounded square border (10% larger) -->
                <rect x="0.45" y="0.45" width="23.1" height="23.1" rx="4.4" ry="4.4" stroke="#FFD700" stroke-width="2"
                  fill="none" />

                <!-- Eraser group scaled 30% larger from center -->
                <g transform="translate(12 10) scale(1.2) translate(-12 -12)">
                  <!-- Eraser body (tilted) -->
                  <path
                    d="M7.5 15.5 L14.5 8.5 Q15.2 7.8 16 8.2 L17.5 9.5 Q18.2 10.2 17.8 11 L10.8 18 Q10.1 18.7 9.3 18.3 L7.8 17 Q7.1 16.3 7.5 15.5 Z"
                    stroke="#FFD700" stroke-width="1.5" stroke-linejoin="round" fill="none" />

                  <!-- Middle band on eraser -->
                  <path d="M10.2 12.8 L13.2 9.8" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round"
                    fill="none" />

                  <!-- Base line under eraser -->
                  <line x1="5.5" y1="20" x2="17.5" y2="20" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round"
                    fill="none" />
                </g>
              </svg>
            </button>

            <button title="Toggle Table Menu" v-if="isActive('table')"
              @click="Toggle_Table_Menu = true; Toggle_Table_Menu_To_Scroll_Event(); Tiptap_Editor.commands.focus();">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <!-- Container -->
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(0.5,0)">
                  <rect x="4.5" y="6" width="11" height="12" fill="none" stroke="#FFD700" stroke-width="1.6" />
                  <path d="M4.5 10h11M4.5 14h11M8.2 6v12M11.8 6v12" stroke="#FFD700" stroke-width="1.4"
                    stroke-linecap="round" />
                </g>

                <g transform="translate(1,0)">
                  <!-- Menu dots -->
                  <circle cx="18.2" cy="9" r="1" fill="#FFD700" />
                  <circle cx="18.2" cy="12" r="1" fill="#FFD700" />
                  <circle cx="18.2" cy="15" r="1" fill="#FFD700" />
                </g>

              </svg>
            </button>

            <button title="Undo" @click="commands.undo();" :class="{ 'Active_btn': Tiptap_Editor.can().undo() }">
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <!-- Background rectangle -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Undo icon scaled + centered -->
                <g transform="translate(5,5) scale(0.18)">
                  <path d="M4.73,9.3v39.28h39.28l4.63,0l-3.27-3.28L33.91,33.85c0.76-0.73,1.54-1.44,2.36-2.11
      c1.08-0.88,2.22-1.72,3.38-2.48l0,0c6.02-3.92,13.21-6.21,20.94-6.21l0.01,0v-0.01c10.59,0,20.18,4.3,27.12,11.24
      c6.94,6.94,11.24,16.53,11.24,27.11h-0.01v0.05h0.01c0,10.59-4.3,20.19-11.24,27.12c-6.94,6.94-16.53,11.24-27.11,11.24v-0.01
      l-0.08,0v0.01c-3.7,0-7.39-0.54-10.93-1.59v0c-1.95-0.58-3.87-1.33-5.71-2.22c-9.39-4.54-16.65-12.8-19.87-22.87l-0.43-1.33
      L0,71.82l0.47,2.3l0.01,0.06v0.01c0.8,3.84,2,7.62,3.53,11.24v0.01c1.51,3.55,3.38,6.98,5.53,10.19
      c11.03,16.43,29.78,27.25,51.05,27.25l0.01,0v-0.01c16.96,0,32.33-6.88,43.43-17.99v-0.01c11.1-11.11,17.98-26.45,17.98-43.4
      l0.01,0v-0.05h-0.01c0-16.96-6.88-32.32-18-43.43l0,0C92.93,6.89,77.58,0.02,60.63,0.01V0l-0.06,0v0.01
      c-8.71,0-17.01,1.82-24.51,5.1c-1.21,0.53-2.42,1.11-3.6,1.71c-5.48,2.83-10.47,6.46-14.83,10.74L8,7.95
      L4.73,4.67V9.3L4.73,9.3L4.73,9.3z" fill="none" stroke="#FFD700" stroke-width="10" stroke-linejoin="round"
                    stroke-linecap="round" />
                </g>
              </svg>
            </button>

            <button title="Redo" @click="commands.redo();" :class="{ 'Active_btn': Tiptap_Editor.can().redo() }">
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <!-- Background rectangle -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Redo icon (mirrored + scaled + centered) -->
                <g transform="translate(27,5) scale(-0.18,0.18)">
                  <path d="M4.73,9.3v39.28h39.28l4.63,0l-3.27-3.28L33.91,33.85c0.76-0.73,1.54-1.44,2.36-2.11
      c1.08-0.88,2.22-1.72,3.38-2.48l0,0c6.02-3.92,13.21-6.21,20.94-6.21l0.01,0v-0.01c10.59,0,20.18,4.3,27.12,11.24
      c6.94,6.94,11.24,16.53,11.24,27.11h-0.01v0.05h0.01c0,10.59-4.3,20.19-11.24,27.12c-6.94,6.94-16.53,11.24-27.11,11.24v-0.01
      l-0.08,0v0.01c-3.7,0-7.39-0.54-10.93-1.59v0c-1.95-0.58-3.87-1.33-5.71-2.22c-9.39-4.54-16.65-12.8-19.87-22.87l-0.43-1.33
      L0,71.82l0.47,2.3l0.01,0.06v0.01c0.8,3.84,2,7.62,3.53,11.24v0.01c1.51,3.55,3.38,6.98,5.53,10.19
      c11.03,16.43,29.78,27.25,51.05,27.25l0.01,0v-0.01c16.96,0,32.33-6.88,43.43-17.99v-0.01c11.1-11.11,17.98-26.45,17.98-43.4
      l0.01,0v-0.05h-0.01c0-16.96-6.88-32.32-18-43.43l0,0C92.93,6.89,77.58,0.02,60.63,0.01V0l-0.06,0v0.01
      c-8.71,0-17.01,1.82-24.51,5.1c-1.21,0.53-2.42,1.11-3.6,1.71c-5.48,2.83-10.47,6.46-14.83,10.74L8,7.95
      L4.73,4.67V9.3L4.73,9.3L4.73,9.3z" fill="none" stroke="#FFD700" stroke-width="10" stroke-linejoin="round"
                    stroke-linecap="round" />
                </g>
              </svg>
            </button>

            <button title="Copy" @click="commands.copyContentToClipboard('editor');">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <!-- Back sheet -->
                <rect x="6" y="5" width="20" height="24" rx="3" fill="none" stroke="#FFD700" stroke-width="2" />
                <!-- Front sheet -->
                <rect x="3" y="1" width="20" height="24" rx="3" fill="none" stroke="#FFD700" stroke-width="2" />
              </svg>
            </button>

            <button class="close_Mark_Down_Menu" @click="
              Toggle_MarkDown_Menu = false;
            Tiptap_Editor.commands.focus();
            " title="Close MarkUp Menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
            <!-- ///////////// -->
          </div>

          <!-- Table toolbar (attached UI) -->
          <div ref="Table_Styling_Btns_Toolbar" v-if="Toggle_Table_Menu" class="attachmentBtns MarkDownMenu">

            <button title="Add Row Before" @click="commands.addRowBefore()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(0,1)">
                  <rect x="6" y="8" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                  <path d="M6 11h12M6 15h12" stroke="#FFD700" stroke-width="1.4" />
                  <path d="M10 7v10M14 7v10" stroke="#FFD700" stroke-width="1.4" />
                </g>
                <!-- Plus (top) -->
                <g transform="translate(0,-0.8)">
                  <path d="M12 4v4M10 6h4" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>
              </svg>
            </button>

            <button title="Add Row After" @click="commands.addRowAfter()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(0,-3)">
                  <rect x="6" y="8" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                  <path d="M6 11h12M6 15h12" stroke="#FFD700" stroke-width="1.4" />
                  <path d="M10 7v10M14 7v10" stroke="#FFD700" stroke-width="1.4" />
                </g>
                <!-- Plus (top) -->
                <g transform="translate(0,0.5)">
                  <!-- Plus (bottom) -->
                  <path d="M12 20v-4M10 18h4" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>
              </svg>
            </button>

            <button title="Delete Row" @click="commands.deleteRow()">
              <svg width="34" height="35" viewBox="0 0 26 27" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="24" height="25" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(1,0.8)">
                  <rect x="6" y="8" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                  <path d="M6 11h12M6 15h12" stroke="#FFD700" stroke-width="1.4" />
                  <path d="M10 7v10M14 7v10" stroke="#FFD700" stroke-width="1.4" />
                </g>
                <!-- Minus (top) -->
                <g transform="translate(1,0.1)">
                  <path d="M8 5h8" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>

                <!-- Minus (bottom) -->
                <g transform="translate(1,17.5)">
                  <path d="M8 5h8" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>

              </svg>
            </button>


            <button title="Add Column Before" @click="commands.addColumnBefore()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(2,-1)">
                  <rect x="6" y="8" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                  <path d="M6 11h12M6 15h12" stroke="#FFD700" stroke-width="1.4" />
                  <path d="M10 7v10M14 7v10" stroke="#FFD700" stroke-width="1.4" />
                </g>
                <!-- Plus (left) -->
                <g transform="translate(-1,0)">
                  <path d="M4 12h4M6 10v4" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>
              </svg>
            </button>


            <button title="Add Column After" @click="commands.addColumnAfter()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(-2,-1)">
                  <rect x="6" y="8" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                  <path d="M6 11h12M6 15h12" stroke="#FFD700" stroke-width="1.4" />
                  <path d="M10 7v10M14 7v10" stroke="#FFD700" stroke-width="1.4" />
                </g>
                <!-- Plus (right) -->
                <g transform="translate(1,0)">
                  <path d="M20 12h-4M18 10v4" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>
              </svg>
            </button>

            <button title="Delete Column" @click="commands.deleteColumn()">

              <svg width="35" height="32" viewBox="0 0 26 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="24" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(1,-0.9)">
                  <rect x="6" y="8" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                  <path d="M6 11h12M6 15h12" stroke="#FFD700" stroke-width="1.4" />
                  <path d="M10 7v10M14 7v10" stroke="#FFD700" stroke-width="1.4" />
                </g>
                <!-- Minus (left) -->
                <g transform="translate(9,0) rotate(90)">
                  <path d="M8 5h8" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>
                <!-- Minus (right) -->
                <g transform="translate(26.8, 0) rotate(90)">
                  <path d="M8 5h8" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />
                </g>
              </svg>
            </button>


            <div class="Styling_Btn_Container">
              <button ref="Table_Cell_BG_Color_Btn" title="Table Cell Background Color"
                @click="Is_Table_Cell_Background_Color_Active ? (Toggle_Table_Cell_Background_Color ? Toggle_Table_Cell_Background_Color = false : commands.unsetTableCellBackgroundColor()) : (Toggle_Table_Cell_Background_Color = !Toggle_Table_Cell_Background_Color, Settings_Style_Btns_Drop_Down_Menus($event)); Tiptap_Editor.commands.focus();"
                :class="{ Active_btn: Is_Table_Cell_Background_Color_Active }">
                <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">

                  <!-- Container -->
                  <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                  <!-- Table outline -->
                  <rect x="4.5" y="6" width="15" height="12" fill="none" stroke="#FFD700" stroke-width="1.6" />

                  <!-- Vertical divider -->
                  <line x1="12" y1="6" x2="12" y2="18" stroke="#FFD700" stroke-width="1.4" />

                  <!-- Horizontal divider -->
                  <line x1="4.5" y1="12" x2="19.5" y2="12" stroke="#FFD700" stroke-width="1.4" />

                  <!-- Highlighted cell (background color) -->
                  <rect x="12" y="12" width="7.5" height="6" fill="#FFD700" opacity="0.35" />

                </svg>
              </button>

              <div style="width: auto;" class="Styling_Btn_Levels"
                :class="[Toggle_Table_Cell_Background_Color ? 'Show_Styling_Btn_level link_Styling_Btn_Levels' : '']">

                <div class="Color_Picker_Container">
                  <input @input="Update_Color_Picker_Preview('table_cell_bg')" ref="Table_Cell_BG_Color_Picker_El"
                    type="color" class="colorPicker">
                  <div ref="Table_Cell_BG_Color_Preview_El" class="preview"
                    @click="Apply_Color_To_Selected_Element('table_cell_bg'); Toggle_Table_Cell_Background_Color = false">
                  </div>
                </div>
                <div class="Opacity_Slider_Container">
                  <label for="opacitySlider">Opacity:</label>
                  <input @input="Update_Color_Picker_Preview('table_cell_bg')"
                    ref="Table_Cell_BG_Color_Opacity_Slider_El" type="range" id="opacitySlider" min="0" max="100"
                    value="100">
                </div>

              </div>
            </div>

            <!-- merge and split cells btns for row op -->
            <button title="Merge Cells" @click="commands.mergeCells()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <!-- Container -->
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Single cell -->
                <rect x="6" y="7" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />

                <!-- Split guide -->
                <path d="M12 9v6" stroke="#FFD700" stroke-width="1.4" stroke-dasharray="0 0" />

                <!-- Outward arrows -->
                <path d="M10 12l-1.5-1.5M10 12l-1.5 1.5" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round" />
                <path d="M14 12l1.5-1.5M14 12l1.5 1.5" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>

            <button title="Split Cell" @click="commands.splitCell()">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <!-- Container -->
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Two cells -->
                <rect x="4.5" y="7" width="6" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                <rect x="13.5" y="7" width="6" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />

                <!-- Center line (max reach, same thickness) -->
                <path d="M8.5 12h7" stroke="#FFD700" stroke-width="2" stroke-linecap="round" />

                <!-- Left arrow (very wide) -->
                <path d="M6.6 12l1.9-1.9M6.6 12l1.9 1.9" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round"
                  stroke-linejoin="round" />

                <!-- Right arrow (very wide) -->
                <path d="M17.4 12l-1.9-1.9M17.4 12l-1.9 1.9" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>


            <button title="Toggle First Row As Header" @click="commands.toggleHeaderRow()">
              <svg width="32" height="32" viewBox="0 0 24 24">
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <rect x="6" y="7" width="12" height="10" fill="none" stroke="#FFD700" stroke-width="1.6" />
                <rect x="6" y="7" width="12" height="4" fill="none" stroke="#FFD700" stroke-width="2" />
              </svg>
            </button>

            <button title="Toggle First Column As Header" @click="commands.toggleHeaderColumn()">
              <svg width="32" height="32" viewBox="0 0 24 24">
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <rect x="7" y="6" width="10.5" height="12" fill="none" stroke="#FFD700" stroke-width="1.6" />
                <rect x="7" y="6" width="4" height="12" fill="none" stroke="#FFD700" stroke-width="2" />
              </svg>
            </button>

            <button title="Toggle Current Cell As Header"
              @click="commands.toggleHeaderCell(); Tiptap_Editor.commands.focus();">
              <svg width="32" height="32" viewBox="0 0 24 24">
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <rect x="6" y="9.5" width="12" height="4.5" fill="none" stroke="#FFD700" stroke-width="2" />
              </svg>
            </button>

            <button title="Move Row Up" @click="commands.moveTableRowUp(); Tiptap_Editor.commands.focus();">
              <svg width="32" height="34" viewBox="0 0 24 27" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="22" height="25" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <rect x="5" y="10" width="14" height="12" fill="none" stroke="#FFD700" stroke-width="1.6" />
                <path d="M5 10h14M5 14h14" stroke="#FFD700" stroke-width="1.4" />

                <!-- Selected row -->
                <rect x="5" y="14" width="14" height="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <g transform="translate(0,0)">

                  <!-- Up arrow -->
                  <path d="M12 4v4M10 6l2-2l2 2" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round"
                    stroke-linejoin="round" />
                </g>
              </svg>
            </button>

            <button title="Move Row Down" @click="commands.moveTableRowDown(); Tiptap_Editor.commands.focus();">
              <svg width="32" height="34" viewBox="0 0 24 27" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="22" height="25" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <rect x="5" y="5" width="14" height="12" fill="none" stroke="#FFD700" stroke-width="1.6" />


                <!-- Selected row -->
                <rect x="5" y="9" width="14" height="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <g transform="translate(0,3)">

                  <!-- Down arrow -->
                  <path d="M12 20v-4M10 18l2 2l2-2" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round"
                    stroke-linejoin="round" />
                </g>

              </svg>
            </button>

            <button title="Move Column Left" @click="commands.moveTableColumnLeft(); Tiptap_Editor.commands.focus();">
              <svg width="34" height="32" viewBox="0 0 27 24">
                <rect x="1" y="1" width="25" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(4.5,0)">
                  <rect x="6" y="5" width="12" height="14" fill="none" stroke="#FFD700" stroke-width="1.6" />

                  <!-- Selected column -->
                  <rect x="10" y="5" width="4" height="14" fill="none" stroke="#FFD700" stroke-width="2" />
                </g>

                <g transform="translate(0,0)">
                  <!-- Left arrow -->
                  <path d="M4 12h4M6 10l-2 2l2 2" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round"
                    stroke-linejoin="round" />
                </g>

              </svg>
            </button>

            <button title="Move Column Right" @click="commands.moveTableColumnRight(); Tiptap_Editor.commands.focus();">
              <svg width="34" height="32" viewBox="0 0 27 24">
                <rect x="1" y="1" width="25" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Table -->
                <g transform="translate(-1,0)">
                  <rect x="6" y="5" width="12" height="14" fill="none" stroke="#FFD700" stroke-width="1.6" />

                  <!-- Selected column -->
                  <rect x="10" y="5" width="4" height="14" fill="none" stroke="#FFD700" stroke-width="2" />
                </g>

                <g transform="translate(3.2,0)">
                  <!-- Right arrow -->
                  <path d="M20 12h-4M18 10l2 2l-2 2" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round"
                    stroke-linejoin="round" />
                </g>

              </svg>
            </button>


            <button title="Clear Selected Cells Content"
              @click="commands.clearSelectedTableCells(); Tiptap_Editor.commands.focus();">
              <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <!-- Outer container -->
                <rect x="1" y="1" width="22" height="22" rx="4" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Eraser -->
                <path d="M7 14.5l6.5-6.5c.6-.6 1.6-.6 2.2 0l2.3 2.3c.6.6.6 1.6 0 2.2L12.5 18H9.2z" fill="none"
                  stroke="#FFD700" stroke-width="1.8" stroke-linejoin="round" />

                <!-- Ground line -->
                <line x1="6" y1="18" x2="18" y2="18" stroke="#FFD700" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>

            <button class="close_Mark_Down_Menu" @click="Toggle_Table_Menu = false; Toggle_Table_Menu_To_Scroll_Event(); Tiptap_Editor.commands.focus();
            " title="Close Table Menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div class="attachmentBtns" v-if="!Toggle_MarkDown_Menu && !Toggle_Table_Menu">
            <label for="fileInput" class="custom_Choose_file" title="Attach File"
              @click.prevent="Show_Select_Input_Source_Selection">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 1 24 24" fill="none"
                stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <!-- Folder Outline -->
                <path
                  d="M2 7C2 5.9 2.9 5 4 5H10L12 7H20C21.1 7 22 7.9 22 9V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V7Z">
                </path>
                <!-- Document Outline -->
                <rect x="6.5" y="9" width="11" height="10" stroke="white" stroke-width="1.5"></rect>
                <line x1="8" y1="11" x2="14" y2="11" stroke="white" stroke-width="1.5"></line>
                <line x1="8" y1="13" x2="14" y2="13" stroke="white" stroke-width="1.5"></line>
              </svg>
            </label>

            <input type="file" id="fileInput" ref="fileInput_tag_ref"
              @change="async (file) => await manageMedia(file, false, null, false)" />

            <!--  -->
            <!-- Overlay -->
            <div v-if="Show_Overlay" class="style-dialog-overlay" @click.self="cancelDialog">
              <!-- Choice Dialog -->
              <div v-if="Show_Choice_Dialog" class="style-dialog">
                <h2>Select Source</h2>
                <button class="option" @click="chooseSource('local')"
                  :disabled="Is_AI_Edit_Started || OCR_Processing || isRecording">
                  <div class="select_file_source_wrapper">
                    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                      <!-- frame -->
                      <rect x="2" y="2" width="60" height="60" rx="12" ry="12" fill="none" stroke="#FFD700"
                        stroke-width="4" />

                      <!-- icon -->
                      <g transform="translate(7.5,6) ">
                        <rect x="4" y="20" width="40" height="20" rx="4" fill="none" stroke="#FFD700"
                          stroke-width="5" />

                        <circle cx="36" cy="30" r="3" stroke="#FFD700" stroke-width="4.4" fill="none" />

                        <path d="M24 6 L24 22" stroke="#FFD700" stroke-width="4.4" stroke-linecap="round" />

                        <path d="M16 16 L24 24 L32 16" stroke="#FFD700" stroke-width="4.4" stroke-linecap="round"
                          stroke-linejoin="round" />
                      </g>
                    </svg>

                    <span> Attach From Device </span>
                  </div>
                </button>

                <button class="option" @click="chooseSource('online')"
                  :disabled="Is_AI_Edit_Started || OCR_Processing || isRecording">
                  <div class="select_file_source_wrapper">
                    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                      <!-- frame -->
                      <rect x="2" y="2" width="60" height="60" rx="12" ry="12" fill="none" stroke="#FFD700"
                        stroke-width="4" />

                      <!-- icon -->
                      <g transform="translate(3,3)">
                        <path d="M12 30 A8 8 0 0 1 20 22 A10 10 0 0 1 40 26 A8 8 0 0 1 40 42 H16 A8 8 0 0 1 12 30 Z"
                          fill="none" stroke="#FFD700" stroke-width="4.4" stroke-linecap="round"
                          stroke-linejoin="round" />

                        <path d="M28 18 L28 34" stroke="#FFD700" stroke-width="4.4" stroke-linecap="round" />

                        <path d="M20 28 L28 36 L36 28" stroke="#FFD700" stroke-width="4.4" stroke-linecap="round"
                          stroke-linejoin="round" />
                      </g>
                    </svg>
                    <span> Attach Online </span>
                  </div>
                </button>

                <button :disabled="Is_AI_Edit_Started || OCR_Processing || isRecording" class="option ocr"
                  @click="chooseSource('OCR')">
                  <div class="select_file_source_wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512" fill="none">
                      <!-- Scan Corners -->
                      <path d="M96 176V128C96 110 110 96 128 96H176" stroke="#FFD700" stroke-width="28"
                        stroke-linecap="round" stroke-linejoin="round" />

                      <path d="M336 96H384C402 96 416 110 416 128V176" stroke="#FFD700" stroke-width="28"
                        stroke-linecap="round" stroke-linejoin="round" />

                      <path d="M416 336V384C416 402 402 416 384 416H336" stroke="#FFD700" stroke-width="28"
                        stroke-linecap="round" stroke-linejoin="round" />

                      <path d="M176 416H128C110 416 96 402 96 384V336" stroke="#FFD700" stroke-width="28"
                        stroke-linecap="round" stroke-linejoin="round" />

                      <!-- Center OCR/Text -->
                      <rect x="148" y="168" width="216" height="36" rx="18" fill="#FFD700" />

                      <rect x="148" y="244" width="150" height="36" rx="18" fill="#FFD700" />

                      <rect x="148" y="320" width="110" height="36" rx="18" fill="#FFD700" />
                    </svg>

                    <div class="select_file_OCR_text_wrapper">
                      <span> OCR Extract Text </span>
                      <div class="Upload_Loader OCR_loader" :class="{ 'Upload_Loader_active': OCR_Processing }"></div>
                    </div>

                  </div>
                </button>

              </div>

              <div v-if="Show_Type_Dialog" class="style-dialog">
                <h2>Select Media Type</h2>

                <button class="option" @click="chooseType('audio')">
                  <div class="select_file_source_wrapper">
                    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                      <!-- frame -->
                      <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="#FFD700" stroke-width="4" />

                      <!-- music note -->
                      <g transform="translate(0,8)">
                        <!-- stem -->
                        <path d="M26 6 L26 34" stroke="#FFD700" stroke-width="4" stroke-linecap="round" />

                        <!-- arm -->
                        <path d="M26 6 L42 2" stroke="#FFD700" stroke-width="4" stroke-linecap="round"
                          stroke-linejoin="round" />

                        <!-- right stem down -->
                        <path d="M42 2 L42 30" stroke="#FFD700" stroke-width="4" stroke-linecap="round" />

                        <!-- left note head -->
                        <circle cx="20" cy="38" r="8" stroke="#FFD700" stroke-width="4" fill="none" />

                        <!-- right note head -->
                        <circle cx="42" cy="34" r="8" stroke="#FFD700" stroke-width="4" fill="none" />

                        <!-- left head connector -->
                        <path d="M26 34 L20 38" stroke="#FFD700" stroke-width="4" stroke-linecap="round" />

                        <!-- right head connector -->
                        <path d="M42 30 L42 34" stroke="#FFD700" stroke-width="4" stroke-linecap="round" />
                      </g>
                    </svg>
                    <span> Audio </span>
                  </div>
                </button>

                <button class="option" @click="chooseType('video')">
                  <div class="select_file_source_wrapper">
                    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                      <!-- frame -->
                      <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="#FFD700" stroke-width="4" />

                      <!-- play window -->
                      <g transform="translate(8,16)">
                        <rect x="4" y="4" width="32" height="24" rx="4" fill="none" stroke="#FFD700" stroke-width="4" />

                        <polygon points="18,10 28,16 18,22" fill="none" stroke="#FFD700" stroke-width="4"
                          stroke-linejoin="round" />

                        <rect x="40" y="8" width="6" height="16" rx="2" fill="none" stroke="#FFD700" stroke-width="4" />
                      </g>
                    </svg>
                    <span> Video </span>
                  </div>
                </button>

                <button class="option" @click="chooseType('image')">
                  <div class="select_file_source_wrapper">
                    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                      <!-- frame -->
                      <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="#FFD700" stroke-width="4" />

                      <!-- image window -->
                      <g transform="translate(10,13)">
                        <rect x="4" y="4" width="36" height="30" rx="4" fill="none" stroke="#FFD700" stroke-width="4" />

                        <!-- sun -->
                        <circle cx="30" cy="14" r="5" stroke="#FFD700" stroke-width="4" fill="none" />

                        <!-- mountain left -->
                        <path d="M8 32 L20 20 L28 28 L40 14" stroke="#FFD700" stroke-width="4" stroke-linecap="round"
                          stroke-linejoin="round" fill="none" />
                      </g>
                    </svg>
                    <span> Image </span>
                  </div>
                </button>

                <button class="option" @click="chooseType('document')">
                  <div class="select_file_source_wrapper">
                    <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                      <!-- frame -->
                      <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="#FFD700" stroke-width="4" />

                      <!-- paper sheet -->
                      <g transform="translate(10,10)">
                        <rect x="4" y="4" width="28" height="36" rx="4" fill="none" stroke="#FFD700" stroke-width="4" />

                        <path d="M32 4 L40 12 L40 40 L32 40" fill="none" stroke="#FFD700" stroke-width="4"
                          stroke-linejoin="round" />

                        <line x1="10" y1="16" x2="30" y2="16" stroke="#FFD700" stroke-width="4"
                          stroke-linecap="round" />

                        <line x1="10" y1="24" x2="30" y2="24" stroke="#FFD700" stroke-width="4"
                          stroke-linecap="round" />

                        <line x1="10" y1="32" x2="26" y2="32" stroke="#FFD700" stroke-width="4"
                          stroke-linecap="round" />
                      </g>
                    </svg>

                    <span> Document </span>
                  </div>
                </button>
              </div>

              <!-- URL Dialog -->
              <div v-if="Show_Url_Dialog" class="media-dialog style-dialog input">
                <h2>Enter Media URL & Name</h2>
                <div class="custom_media_url_Input">
                  <input type="url" autofocus required v-model.trim="Media_Url"
                    placeholder="https://example.com/file.mp4" />
                  <input type="text" required v-model.trim="Media_Name" placeholder="Name" />
                </div>
                <div class="dialog-buttons">
                  <button class="cancel-btn" @click="cancelDialog">Cancel</button>
                  <button class="apply-btn" @click="applyDialog">Apply</button>
                </div>
              </div>
            </div>

            <!--  -->

            <button @click="menuVisible = !menuVisible; stopEverything()" class="STT_btn" title="Speech to text">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512" fill="none">
                <rect x="26" y="100" width="33" height="76" rx="16.5" fill="#FFD700" />
                <rect x="90" y="36" width="33" height="203" rx="16.5" fill="#FFD700" />
                <rect x="154" y="78" width="33" height="119" rx="16.5" fill="#FFD700" />
                <rect x="218" y="100" width="33" height="76" rx="16.5" fill="#FFD700" />

                <rect x="176" y="355" width="157" height="33" rx="16.5" fill="#FFD700" />

                <path
                  d="M290 95H430C461.3 95 487 120.7 487 152V438C487 469.3 461.3 495 430 495H110C78.7 495 53 469.3 53 438V281"
                  stroke="#FFD700" stroke-width="33" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <button ref="recordAudioButton" @click="AudioRec"
              :title="Is_Audio_Recording ? 'Stop Recording' : 'Record Audio'">
              <svg v-show="Is_Audio_Recording" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"></circle>
                <rect x="9" y="9" width="6" height="6" rx="1" fill="#FFD700"></rect>
              </svg>

              <svg v-show="!Is_Audio_Recording" viewBox="0 0 24 24">
                <path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3z"></path>
                <path
                  d="M19 11a1 1 0 00-1 1v1a6 6 0 01-12 0v-1a1 1 0 00-2 0v1a8 8 0 008 8 8 8 0 008-8v-1a1 1 0 00-1-1z">
                </path>
              </svg>
            </button>

            <button ref="recordVideoButton" v-show="!Front_Back_Camera" @click="VideoRec"
              :title="Is_Video_Recording ? 'Stop Recording' : 'Record Video'">
              <svg v-show="Is_Video_Recording" style="width: 4vmin !important" xmlns="http://www.w3.org/2000/svg"
                width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"></circle>
                <rect x="9" y="9" width="6" height="6" rx="1" fill="#FFD700"></rect>
              </svg>

              <svg v-show="!Is_Video_Recording" viewBox="0 0 24 24">
                <path
                  d="M17 10.5v-2A2.5 2.5 0 0014.5 6h-9A2.5 2.5 0 003 8.5v7A2.5 2.5 0 005.5 18h9a2.5 2.5 0 002.5-2.5v-2l4 3v-9l-4 3z">
                </path>
              </svg>
            </button>


            <button @click="
              Is_FlashLight_On = !Is_FlashLight_On;
            Toggle_Torch();
            " class="torch" :class="{ Flash_light_not_available: !Is_FlashLight_Supported }"
              ref="flash_light_btn_element" title="Flash Light">
              <!-- 24×24 Lightning Icon (OFF by default) -->
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20">
                <!-- Lightning bolt path -->
                <path :class="[
                  { flash_light_on: Is_FlashLight_On },
                  { Flash_light_not_available: !Is_FlashLight_Supported },
                ]" d="M13 4 L7 14 h4 l-1 6 l7-12 h-4 Z" fill="none" stroke="#FFD700" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <button id="useFrontCamera" v-show="Front_Back_Camera" @click="FrontCamVideoRec" title="Front Camera">
              <svg width="100" height="100" viewBox="0 -2 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                stroke="gold" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="6" width="18" height="12" rx="2" ry="2" stroke="gold" fill="none" />
                <circle cx="12" cy="12" r="3" stroke="gold" />
                <circle cx="18" cy="8" r="1" fill="gold" />
                <rect x="8" y="3" width="8" height="2" rx="1" fill="gold" />
              </svg>
            </button>

            <button id="useBackCamera" v-show="Front_Back_Camera" @click="BackCamVideoRec" title="Back Camera">
              <svg width="24" height="24" viewBox="2 0 20 20" stroke="white" xmlns="http://www.w3.org/2000/svg">
                <!-- Camera Body -->
                <rect x="3" y="4" width="18" height="14" rx="2" stroke="gold" stroke-width="2" />

                <!-- Lens -->
                <circle cx="9" cy="12" r="4" stroke="black" stroke-width="2" />

                <!-- Flash -->
                <circle cx="18" cy="10" r="2.5" fill="black" />
              </svg>
            </button>

            <button @click="Render_kbd_UI" title="Keyboard Shortcuts">
              <svg style="transform: scale(1.3)" width="32" height="32" viewBox="0 0 32 32">
                <!-- Outer container -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />
                <g transform="translate(0,-2)">
                  <!-- Keyboard body -->
                  <rect x="6" y="10" width="20" height="16" rx="2" ry="2" fill="none" stroke="#FFD700"
                    stroke-width="1.5" />
                  <g transform="translate(0.5,0)">
                    <!-- Keys row 1 -->
                    <rect x="8" y="12" width="3" height="3" rx="0.6" stroke="#FFD700" fill="none" stroke-width="1.2" />
                    <rect x="12" y="12" width="3" height="3" rx="0.6" stroke="#FFD700" fill="none" stroke-width="1.2" />
                    <rect x="16" y="12" width="3" height="3" rx="0.6" stroke="#FFD700" fill="none" stroke-width="1.2" />
                    <rect x="20" y="12" width="3" height="3" rx="0.6" stroke="#FFD700" fill="none" stroke-width="1.2" />
                  </g>

                  <g transform="translate(0,0.7)">
                    <!-- Keys row 2 -->
                    <rect x="10" y="16" width="3" height="3" rx="0.6" stroke="#FFD700" fill="none" stroke-width="1.2" />
                    <rect x="14.5" y="16" width="3" height="3" rx="0.6" stroke="#FFD700" fill="none"
                      stroke-width="1.2" />
                    <rect x="19" y="16" width="3" height="3" rx="0.6" stroke="#FFD700" fill="none" stroke-width="1.2" />
                  </g>

                  <!-- Space bar -->
                  <rect x="10" y="21.5" width="12" height="2.5" rx="1" fill="none" stroke="#FFD700"
                    stroke-width="1.2" />
                </g>
              </svg>
            </button>

            <button v-if="disable_color_notes_switcher_btn" class="toggle_note_color_mode"
              @click="Toggle_Note_Card_Color_Mode" title="Toggle Note Color">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Sticky Note Shape -->
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2" fill="gray" stroke="gold" stroke-width="1.5" />
                <!-- Colorful Half -->
                <path d="M12 4h8v16h-8z" fill="url(#grad1)" stroke="black" stroke-width="1.5" />
                <!-- Toggle Indicator -->
                <circle :class="{
                  color_full_notes_card_active_toggler: Is_Sticky_Colorful_Card,
                }" cx="18" cy="18" r="5" fill="gray" stroke="black" stroke-width="1" />
                <path :class="{
                  color_full_notes_card_active_line: Is_Sticky_Colorful_Card,
                }" d="M16 18h4" stroke="black" stroke-width="1.5" stroke-linecap="round" />
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#FF4500" />
                    <stop offset="50%" stop-color="#FFD700" />
                    <stop offset="100%" stop-color="#00FF00" />
                  </linearGradient>
                </defs>
              </svg>
            </button>

            <button class="MarkDownMenu" title="Toggle Styling Menu" @click=" Toggle_MarkDown_Menu = !Toggle_MarkDown_Menu;
            Tiptap_Editor.commands.focus();
            Front_Back_Camera = false;
            ">
              <svg width="24" height="24" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <!-- Black background with gold border -->
                <rect x="1" y="1" width="30" height="30" rx="6" ry="6" fill="none" stroke="#FFD700" stroke-width="2" />

                <!-- Left angled bracket -->
                <path d="M10 8 L5 16 L10 24" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />

                <!-- Right angled bracket -->
                <path d="M22 8 L27 16 L22 24" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />

                <!-- Center "A" -->
                <text x="16" y="20" text-anchor="middle" font-family="Georgia, serif" fill="#FFD700" font-weight="bold">
                  A
                </text>
              </svg>
            </button>
          </div>
        </div>

        <input name="Main_Note_Writing_Area" ref="focusOnInput" type="text" class="title" placeholder="Note Title"
          v-model="CurrentlyWritingTitle" />

        <!--  -->
        <div class="delete-modal" id="deleteModal" :class="{ active: toggle_delete_model }">
          <div class="header">
            <h2>Attachments</h2>
            <button class="close-modal" @click="
              toggle_delete_model = false;
            Close_Btn_Sound.play();
            " title="Close_Attachments_Panel">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                class="feather feather-x">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Video Section -->
          <div class="all_media_types_container">
            <div class="section">
              <div class="section-title">Video</div>
              <div class="scrollable">
                <ul class="media-list" v-if="Video_Array.length > 0">
                  <li class="items" :key="index" v-for="(item, index) in Video_Array" :class="{
                    media_and_file_delete_animation: item?.deletion,
                  }">
                    <span>{{ item?.name }}</span>
                    <button class="delete-btn" @click="delete_media(index, 'video')" title="Delete Video">
                      🗑
                    </button>
                  </li>
                </ul>
                <p class="empty-message" v-if="Video_Array.length <= 0">
                  No video files available
                </p>
              </div>
            </div>

            <!-- Audio Section -->
            <div class="section">
              <div class="section-title">Audio</div>
              <div class="scrollable">
                <ul class="recording-list" v-if="Audio_Array.length > 0">
                  <li class="items" :key="index" v-for="(item, index) in Audio_Array" :class="{
                    media_and_file_delete_animation: item?.deletion,
                  }">
                    <span>{{ item?.name }}</span>
                    <button class="delete-btn" @click="delete_media(index, 'audio')" title="Delete Audio">
                      🗑
                    </button>
                  </li>
                </ul>
                <p class="empty-message" v-if="Audio_Array.length <= 0">
                  No audio files available
                </p>
              </div>
            </div>

            <!-- Image Section -->
            <div class="section">
              <div class="section-title">Images</div>
              <div class="scrollable">
                <ul class="file-list" v-if="Image_Array.length > 0">
                  <li class="items" :key="index" v-for="(item, index) in Image_Array"
                    :class="{ media_and_file_delete_animation: item?.deletion }">
                    <span>{{ item?.name }}</span>
                    <button class="delete-btn" @click="delete_media(index, 'image')" title="Delete Image">
                      🗑
                    </button>
                  </li>
                </ul>
                <p class="empty-message" v-if="Image_Array.length <= 0">
                  No image files available
                </p>
              </div>
            </div>

            <!-- Docs Section -->
            <div class="section">
              <div class="section-title">Documents</div>
              <div class="scrollable">
                <ul class="file-list" v-if="Document_Array.length > 0">
                  <li class="items" :key="index" v-for="(item, index) in Document_Array" :class="{
                    media_and_file_delete_animation: item?.deletion,
                  }">
                    <span>{{ item?.name }}</span>
                    <button class="delete-btn" @click="delete_media(index, 'doc')" title="Delete Document">
                      🗑
                    </button>
                  </li>
                </ul>
                <p class="empty-message" v-if="Document_Array.length <= 0">
                  No document files available
                </p>
              </div>
            </div>
          </div>
        </div>
        <!--  -->

        <div class="notes_Writing_Area_Wrapper">
          <!-- bubble-menu desktop screens -->


          <!-- 1. Remove the class from the root BubbleMenu component -->
          <BubbleMenu v-if="Tiptap_Editor && !Show_prompt_input_dialog" :editor="Tiptap_Editor" placement="top"
            :options="bubbleMenuOptions" :update-delay="0" :should-show="shouldShowBubbleMenu">

            <!-- 2. Create an inner wrapper and put the class HERE -->
            <div class="bubble-menu">
              <div class="bm_btn_wrapper" v-for="(item, idx) in Bubble_Menu" :key="idx">
                <button class="bm-btn" @click="item.action === 'Custom' ? Open_dialog(item) : Modify_By_AI(item)"
                  :class="[{ loader_disable_btn_effects: item.loading }, { mb_stop_btn: item.action === 'Stop' }]">
                  <b :class="{ bm_label_fade: item.loading }">{{ item.action }}</b>
                  <div v-if="item.loading" class="Upload_Loader bubble_menu_btn_loader"> </div>
                </button>
                <div v-if="Bubble_Menu.length - 1 !== idx" class="bm-divider"> </div>
              </div>
            </div>

          </BubbleMenu>


          <!-- AI Status Bar -->
          <div v-if="Is_AI_Edit_Started" class="ai-floating-bar">
            <div class="ai-bar-content">
              <div class="ai-status">
                <span class="ai-dot"></span>
                <span class="ai-text">{{ AI_Generation_Status }}</span>
              </div>

              <button @click="Stop_AI_Generation" class="stop-button">
                ⏹️ Stop
              </button>
            </div>
          </div>


          <!-- OCR Status Bar -->
          <div v-if="OCR_Processing" class="ai-floating-bar">
            <div class="ai-bar-content">
              <div class="ai-status">
                <span class="ai-dot"></span>
                <span class="ai-text">{{ OCR_Status }}</span>
              </div>

              <button @click="Stop_OCR" class="stop-button">
                ⏹️ Stop
              </button>
            </div>
          </div>


          <div class="prompt-overlay" :class="{ active: Show_prompt_input_dialog }" id="promptOverlay"
            @click="Show_prompt_input_dialog = false; fullyCloseSTT();">
            <div class="prompt-dialog" @click.stop>
              <div class="prompt-dialog-header">
                <label class="prompt-dialog-label" for="promptInput">Prompt</label>

                <div class="prompt_stt_menu">

                  <button class="pill-btn lang-select" @click="toggle_prompt_Dropdown">
                    <span class="flag-icon">{{languages.find(l => l.code === selectedLang)?.flag}}</span>
                    <span class="lang-code">{{ selectedLang.toUpperCase() }}</span>
                  </button>

                  <div v-if="Is_prompt_dropdown_open" :class="{ active: Is_prompt_dropdown_animate }"
                    class="stt-dropdown-list prompt_dropdown">
                    <div v-for="lang in languages.sort((a, b) => a.name.localeCompare(b.name))" :key="lang.code"
                      class="drop-item" @click="selectLanguage(lang, 'prompt')">
                      <span class="drop-flag">{{ lang.flag }}</span> <span> {{ lang.name }}</span>
                    </div>
                  </div>

                </div>

              </div>

              <textarea v-model.trim="prompt_input" ref="prompt_dialog_input_ref" id="promptInput"
                class="prompt-dialog-input" placeholder="Write instructions to change selected content…"
                rows="3"></textarea>

              <div class="prompt-dialog-actions">

                <button class="pill-btn mic-action prompt_mic"
                  :class="[status.toLowerCase(), { 'is-active': isRecording }]" @click="handleMicTapped('prompt')">
                  <div v-if="status === 'Connecting'" class="spinner"></div>

                  <svg v-else-if="isRecording" class="prompt_pill_icon" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                  </svg>

                  <svg v-else class="prompt_pill_icon" viewBox="0 0 24 24">
                    <path
                      d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                      fill="currentColor" />
                  </svg>

                  <div v-if="isRecording" class="ripple-ring"></div>
                </button>

                <div class="prompt_dialog_actions_btns">
                  <button class="prompt-btn prompt-btn--cancel"
                    @click="Show_prompt_input_dialog = false; fully_close_prompt_STT();">Cancel</button>
                  <button class="prompt-btn prompt-btn--apply" @click="applyPrompt">Apply</button>
                </div>
              </div>

            </div>
          </div>



          <!-- EDITOR ELEMENT -->
          <EditorContent name="notewriting" ref="editor" :editor="Tiptap_Editor">
          </EditorContent>

          <div :class="{ 'Show_Paste_Processing_Loader': Paste_Procssing }"
            class="Upload_Loader Upload_Loader_active_media'">
          </div>

          <video class="vid" alt="overlay_displaying_recording_of_live_video" ref="videoPreview" autoplay muted></video>
        </div>

        <!-- Overlay for Audio Recording -->
        <div id="overlay" ref="overlayElement">
          <div class="sound-bars">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>

        <div class="note_create_edit_model_btns_container">
          <button class="btn delete_media_panel_toggle_btn" @click="
            toggle_delete_model = !toggle_delete_model;
          View_Btn_Sound.play();
          " title="View Attachments Deletion Panel">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <!-- Trash Bin -->
              <path d="M4 6h16" stroke="currentColor"></path>
              <path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="currentColor"></path>
              <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" stroke="currentColor"></path>

              <!-- File Icon Inside Trash Bin -->
              <rect x="9" y="9" width="6" height="8" rx="1" stroke="currentColor" fill="none"></rect>
              <path d="M9 9l3-3 3 3" stroke="currentColor" fill="none"></path>

              <!-- "X" Symbol Over File -->
              <line x1="10" y1="12" x2="14" y2="16" stroke="currentColor"></line>
              <line x1="14" y1="12" x2="10" y2="16" stroke="currentColor"></line>
            </svg>
          </button>


          <!-- STT Menu -->

          <div :class="{ active: menuVisible }" class="stt-pill-wrapper">

            <div v-if="isDropdownOpen" :class="{ active: isDropdownAnimation }" class="stt-dropdown-list">
              <div v-for="lang in languages.sort((a, b) => a.name.localeCompare(b.name))" :key="lang.code"
                class="drop-item" @click="selectLanguage(lang)">
                <span class="drop-flag">{{ lang.flag }}</span> <span> {{ lang.name }}</span>
              </div>
            </div>

            <div class="stt-pill-main" :class="{ 'error-border': status === 'Error' }">

              <button class="pill-btn lang-select" @click="toggleDropdown">
                <span class="flag-icon">{{languages.find(l => l.code === selectedLang)?.flag}}</span>
                <span class="lang-code">{{ selectedLang.toUpperCase() }}</span>
              </button>

              <div class="pill-divider"></div>

              <button class="pill-btn mic-action" :class="[status.toLowerCase(), { 'is-active': isRecording }]"
                @click="handleMicTapped">
                <div v-if="status === 'Connecting'" class="spinner"></div>

                <svg v-else-if="isRecording" class="pill-icon" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                </svg>

                <svg v-else class="pill-icon" viewBox="0 0 24 24">
                  <path
                    d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                    fill="currentColor" />
                </svg>

                <div v-if="isRecording" class="ripple-ring"></div>
              </button>

              <div class="pill-divider"></div>

              <button class="pill-btn close-x" @click="fullyCloseSTT">
                <svg class="pill-icon-small" viewBox="0 0 24 24">
                  <path
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>




          <!-- TTS Menu -->
          <div class="tts-shell" :class="{ active: Show_TTS_Player }" id="ttsShell">
            <div class="tts-menu" id="ttsMenu">

              <div class="tts-left">
                <div class="tts-wave">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9
                   C4.2 6.8 5.3 6.8 6.5 9
                   C7.7 11.2 8.8 11.2 10 9
                   C11.2 6.8 12.3 6.8 13.5 9
                   C14.7 11.2 15.8 11.2 17 9
                   C18.2 6.8 19.3 6.8 20.5 9" stroke="#efc248" stroke-width="1.9" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path d="M3 15
                   C4.2 12.8 5.3 12.8 6.5 15
                   C7.7 17.2 8.8 17.2 10 15
                   C11.2 12.8 12.3 12.8 13.5 15
                   C14.7 17.2 15.8 17.2 17 15
                   C18.2 12.8 19.3 12.8 20.5 15" stroke="#efc248" stroke-width="1.9" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </div>

                <div class="tts-meta">
                  <div class="tts-time">{{ currentTimeDisplay }}</div>
                </div>
              </div>

              <div class="tts-divider"></div>

              <div class="tts-controls">

                <button @click="seek(-10)" class="tts-btn" aria-label="Back 10 seconds">
                  <svg class="tts-step-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(-10,-15)">
                      <path d="M30 25 A16 16 0 1 1 18 38" stroke="currentColor" stroke-width="3.8"
                        stroke-linecap="round" />
                    </g>
                    <g transform="translate(5,-6)">
                      <path d="M18 10 L10 16 L18 22" stroke="currentColor" stroke-width="3.8" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </g>
                    <text x="22.5" y="30" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor"
                      font-family="Segoe UI, sans-serif">10</text>
                  </svg>
                </button>

                <button @click="togglePause" class="tts-btn primary" aria-label="Play">

                  <!-- Play -->
                  <svg v-if="!isPlaying" class="tts-play-icon" viewBox="0 0 24 24" fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5.5
                   C8 4.7 8.9 4.2 9.6 4.7
                   L18 10.3
                   C18.7 10.8 18.7 12 18 12.5
                   L9.6 18.1
                   C8.9 18.6 8 18.1 8 17.3
                   Z" />
                  </svg>

                  <!-- Pause -->
                  <svg v-else class="tts-pause-icon" viewBox="0 0 24 24" fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="5.5" width="3.5" height="13" rx="0.8" />
                    <rect x="14.5" y="5.5" width="3.5" height="13" rx="0.8" />
                  </svg>

                </button>

                <button @click="seek(10)" class="tts-btn" aria-label="Forward 10 seconds">
                  <svg class="tts-step-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(10,-16)">
                      <path d="M18 26 A16 16 0 1 0 30 38" stroke="currentColor" stroke-width="3.8"
                        stroke-linecap="round" />
                    </g>
                    <g transform="translate(-5,-6)">
                      <path d="M30 10 L38 16 L30 22" stroke="currentColor" stroke-width="3.8" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </g>
                    <text x="23" y="29" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor"
                      font-family="Segoe UI, sans-serif">10</text>
                  </svg>
                </button>

                <div class="tts-speed" id="speedWrap">
                  <button @click="Toggle_Playback_dropdown = !Toggle_Playback_dropdown" class="tts-btn tts-speed-btn"
                    id="speedBtn" aria-label="Playback speed">
                    <span class="tts-speed-text" id="speedText">{{ playbackRate }}x</span>
                  </button>

                  <div class="tts-speed-menu" :class="{ active: Toggle_Playback_dropdown }" id="speedMenu">
                    <button @click="playbackRate = item.speed; Toggle_Playback_dropdown = false"
                      v-for="(item, idx) in playbackRate_Speeds" :key="idx" class="tts-speed-option">{{ item.msg
                      }}</button>
                  </div>
                </div>

                <button @click="stopEverything" class="tts-btn tts-close" id="closeTTS" aria-label="Close">
                  <svg class="tts-close-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6L18 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
                    <path d="M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
                  </svg>
                </button>
              </div>

            </div>
          </div>



          <div :class="{
            Load_All_Notes_Container_Show_override_position: Attachment_Capacity_Violation_Toggle_Message,
          }" class="Load_All_Notes_Container override_Load_All_Notes_Container_position">
            <h3 ref="Note_Attachment_Limit_Warning_Message" style="color: #1b1b1b">
              ✨ Not Enough Capacity Left! ✨
            </h3>
            <button @click="Attachment_Capacity_Violation_Toggle_Message = false"
              class="Load_All_Notes_Container_Close_Btn" title="Close Attachment Capacity Violation Message">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="edit_create_done_close_btn">
            <button ref="Note_Create_Close_btn" @click="CloseBtn('note_making')" class="btn close_note_create_edit_btn"
              title="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
            <button @click="DoneBtn" ref="DisableDoneBtnElement" class="btn" title="Done">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </button>
          </div>
        </div>
      </dialog>
    </div>

    <!-- View Notes UI -->
    <div class="Notes_View_UI_Container" :class="{ active: IsRoViewNoteOpen }" @click.self="CloseBtn(null)">
      <dialog ref="note_view_ui_element" open="" class="notepage" :class="{
        notepage_full_screen: Toggle_Reading_Form_Full_Screen,
      }" :style="boxStyle">
        <div class="notepag_con" ref="View_Note_Page_UI"
          :class="{ notepag_con_full_screen: Toggle_Reading_Form_Full_Screen }">
          <section class="Notepage_View_Full_Screen_And_Change_Color_Container">
            <p class="Notes_View_UI_Heading">Read Mode</p>
            <div class="View_Content_buttons">
              <button class="btn" @click="Toggle_Note_Full_Screen" title="Full Screen">
                <svg v-show="!Toggle_Reading_Form_Full_Screen" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                  viewBox="0 0 24 24" fill="#2A2A2A" stroke="#2A2A2A" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round">
                  <polyline points="9 3, 3 3, 3 9"></polyline>
                  <line x1="3" y1="3" x2="9" y2="9"></line>

                  <polyline points="15 3, 21 3, 21 9"></polyline>
                  <line x1="21" y1="3" x2="15" y2="9"></line>

                  <polyline points="9 21, 3 21, 3 15"></polyline>
                  <line x1="3" y1="21" x2="9" y2="15"></line>

                  <polyline points="15 21, 21 21, 21 15"></polyline>
                  <line x1="21" y1="21" x2="15" y2="15"></line>
                </svg>
                <!-- ------------------------- -->
                <svg v-show="Toggle_Reading_Form_Full_Screen" height="24" width="24" version="1.1" id="Capa_1"
                  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 13.594 13.594" xml:space="preserve">
                  <g>
                    <g>
                      <path style="fill: #2a2a2a" d="M0.035,1.76c0.632,0.631,1.6,1.601,2.185,2.186c0.253,0.252,0.417,0.416,0.417,0.416
			S1.963,5.039,1.682,5.318C1.403,5.596,1.903,5.583,1.903,5.583L5.65,5.937c0,0,0.304,0.025,0.304-0.268
			c0-0.401-0.474-3.761-0.474-3.761s0-0.511-0.339-0.171c-0.34,0.342-0.884,0.884-0.884,0.884S4.11,2.473,3.884,2.246
			C3.312,1.674,2.303,0.666,1.67,0.033C1.439,0.842,0.825,1.487,0.035,1.76z"></path>
                      <path style="fill: #2a2a2a" d="M7.896,11.58c0,0-0.001,0.512,0.339,0.172s0.885-0.883,0.885-0.883s0.146,0.146,0.372,0.373
			c0.601,0.602,1.689,1.689,2.312,2.313c0.294-0.781,0.957-1.381,1.776-1.586c-0.598-0.6-1.758-1.76-2.423-2.426
			c-0.253-0.252-0.418-0.416-0.418-0.416s0.677-0.678,0.955-0.955c0.28-0.279-0.221-0.266-0.221-0.266L7.727,7.551
			c0,0-0.303-0.021-0.303,0.27C7.424,8.221,7.896,11.58,7.896,11.58z"></path>
                      <path style="fill: #2a2a2a" d="M1.716,13.561c0.614-0.613,1.721-1.721,2.363-2.363c0.251-0.252,0.416-0.416,0.416-0.416
			s0.677,0.678,0.957,0.957c0.279,0.277,0.265-0.223,0.265-0.223L6.07,7.77c0,0,0.025-0.303-0.267-0.303
			C5.4,7.467,2.04,7.94,2.04,7.94S1.529,7.938,1.87,8.28c0.341,0.338,0.883,0.881,0.883,0.881S2.606,9.309,2.378,9.536
			C1.754,10.159,0.607,11.309,0,11.915C0.806,12.151,1.448,12.768,1.716,13.561z"></path>
                      <path style="fill: #2a2a2a" d="M13.594,1.685c-0.629,0.629-1.644,1.644-2.247,2.249c-0.252,0.251-0.417,0.414-0.417,0.414
			s0.676,0.677,0.955,0.957c0.28,0.28-0.22,0.266-0.22,0.266L7.917,5.925c0,0-0.302,0.024-0.302-0.269
			c0-0.402,0.472-3.761,0.472-3.761s-0.002-0.511,0.34-0.172C8.766,2.065,9.31,2.606,9.31,2.606S9.458,2.46,9.683,2.232
			c0.551-0.55,1.508-1.509,2.146-2.144C12.117,0.871,12.776,1.472,13.594,1.685z"></path>
                    </g>
                  </g>
                </svg>
              </button>

              <button @click="align_Note_View_UI_Text" class="btn" title="Change Text Alignment">
                <svg v-show="Alignment_index == 0" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                  viewBox="0 0 24 24" fill="#2A2A2A" stroke="#2A2A2A" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="15" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>

                <svg v-show="Alignment_index == 1" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                  viewBox="0 0 24 24" fill="#2A2A2A" stroke="#2A2A2A" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round">
                  <line x1="6" y1="6" x2="18" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="6" y1="18" x2="18" y2="18"></line>
                </svg>

                <svg v-show="Alignment_index == 2" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                  viewBox="0 0 24 24" fill="#2A2A2A" stroke="#2A2A2A" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="9" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>

              <button class="btn" :style="buttonStyle" @click="changeColor" title="Change Color">
                <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M16 8C16 8.33866 15.979 8.67241 15.9381 9H8V11L11 14V15.4185C10.0736 15.7935 9.0609 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM3 9C3.55228 9 4 8.55229 4 8C4 7.44772 3.55228 7 3 7C2.44772 7 2 7.44772 2 8C2 8.55229 2.44772 9 3 9ZM9 3C9 3.55228 8.55229 4 8 4C7.44772 4 7 3.55228 7 3C7 2.44772 7.44772 2 8 2C8.55229 2 9 2.44772 9 3ZM5.17137 5.17158C5.56189 4.78106 5.56189 4.14789 5.17137 3.75737C4.78084 3.36685 4.14768 3.36685 3.75716 3.75737C3.36663 4.14789 3.36663 4.78106 3.75716 5.17158C4.14768 5.56211 4.78084 5.56211 5.17137 5.17158ZM12.2428 5.17161C11.8522 5.56214 11.2191 5.56214 10.8285 5.17161C10.438 4.78109 10.438 4.14792 10.8285 3.7574C11.2191 3.36688 11.8522 3.36688 12.2428 3.7574C12.6333 4.14792 12.6333 4.78109 12.2428 5.17161ZM5.17146 10.8284C4.78094 10.4379 4.14777 10.4379 3.75725 10.8284C3.36672 11.2189 3.36672 11.8521 3.75725 12.2426C4.14777 12.6331 4.78094 12.6331 5.17146 12.2426C5.56199 11.8521 5.56199 11.2189 5.17146 10.8284Z"
                    fill="#2A2A2A"></path>
                </svg>
              </button>

              <button class="btn" title="Copy" @click="commands.copyContentToClipboard('read')">
                <template v-if="Read_mode_copy_success">
                  <!-- Tick -->
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                    <path d="M8 16.5 L13.5 22 L24 10" fill="none" stroke="#2A2A2A" stroke-width="2.5"
                      stroke-linecap="round" stroke-linejoin="round"
                      transform="translate(16 16) scale(1.5) translate(-16 -16)" />
                  </svg>
                </template>

                <template v-else>
                  <!-- Copy -->
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                    <!-- Back sheet -->
                    <rect x="6" y="5" width="20" height="24" rx="3" fill="none" stroke="#2A2A2A" stroke-width="2" />
                    <!-- Front sheet -->
                    <rect x="3" y="1" width="20" height="24" rx="3" fill="none" stroke="#2A2A2A" stroke-width="2" />
                  </svg>
                </template>
              </button>

              <!-- App.vue: PDF export (replace existing pdf-export-menu block) -->
              <div class="pdf-export-menu" ref="pdfBtnRef">
                <button class="btn pdf-main-btn" @click="togglePdfMenu" title="Export as PDF">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- PDF Document Icon -->
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#2A2A2A"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                    <polyline points="14 2 14 8 20 8" stroke="#2A2A2A" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <text x="8" y="16" font-family="Arial" font-size="6" font-weight="bold" fill="#2A2A2A">PDF</text>
                    <path d="M12 19v-6m-3 3l3 3 3-3" stroke="#2A2A2A" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </button>
              </div>

              <teleport to="body">
                <div v-if="pdfMenuOpen" class="pdf-submenu" :style="pdfSubmenuStyle" ref="pdfSubRef" @click.stop>
                  <button class="pdf-sub-btn" @click="exportNoteAsPdf(true); closePdfMenu()"
                    title="Print with white background">
                    <span class="sub-icon">⚪</span> White Print
                  </button>
                  <button class="pdf-sub-btn" @click="exportNoteAsPdf(false); closePdfMenu()"
                    title="Print with dark background">
                    <span class="sub-icon">⚫</span> Black Print
                  </button>
                </div>
              </teleport>


            </div>
          </section>

          <div class="read_mode_content">
            <div class="View_Text_In_UI View_Text_In_UI_Title" v-html="SendNoteForView_Title"></div>
            <div ref="Note_View_UI_Text_Element" :key="Reset_RO_View_Text_UI"
              style="padding-bottom: clamp(2rem, 8vw, 5rem);" class="Read_only_mode View_Text_In_UI"
              v-html="SendNoteForView_Message"></div>
          </div>


          <!-- view ui closing btn -->
          <button class="btn close_note_create_edit_btn" @click="CloseBtn(null)" title="Close"
            style="position: absolute; bottom: 0; z-index: 100;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6L6 18"></path>
              <path d="M6 6l12 12"></path>
            </svg>
          </button>

        </div>


      </dialog>
    </div>
  </div>
  <!-- Wrapper End -->

  <!-- Error Section -->
  <div class="Critical_Error" :class="{ Critical_Error_Active: Toggle_Critical_Error }">
    <p ref="Critical_Error_Message">Something Went Wrong</p>
    <button @click="Toggle_Critical_Error = false" title="Hide">X</button>
  </div>

  <div class="combine_footer_Loaded_All_Notes" :class="{ active: Blur_Background_WhileOpening_Note }">
    <!-- Miscellous features -->
    <div :class="{
      Load_All_Notes_Container_Show: All_Notes_Loaded_Message_Container_Element,
    }" class="Load_All_Notes_Container">
      <h3 ref="All_Notes_loaded_Element">✨ All Notes Are Loaded! ✨</h3>
      <button @click="Hide_All_Notes_Loaded_Container" class="Load_All_Notes_Container_Close_Btn" title="Close">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Footer Features -->
    <div class="notes-actions">
      <div class="storage_capacity" title="Storage Capacity">
        <div class="storage_cap_text">{{ Used_Storage_Capacity }}G / {{ Total_Storage_Capacity }}G</div>
        <span class="used_capacity" ref="Used_Storage_Capacity_Element">
        </span>
      </div>

      <button class="btn" @click="fetchAllNotes" title="Load More Notes" :disabled="deleteTimeouts.size">
        <svg v-show="!More_Notes_Are_Coming" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <circle cx="6" cy="12" r="1" fill="currentColor" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <circle cx="18" cy="12" r="1" fill="currentColor" />
          <path d="M12 16v4m-3-3 3 3 3-3" stroke="currentColor" />
        </svg>
        <div class="Upload_Loader More_Notes_Loader" v-show="More_Notes_Are_Coming"></div>
      </button>
      <button class="btn sorting" @click="sorting" title="Sort Notes" :disabled="deleteTimeouts.size">
        <svg v-show="sort_order === 'asc'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 4l4-4 4 4" stroke="currentColor" fill="none" />
          <path d="M8 20l4 4 4-4" stroke="currentColor" fill="currentColor" />
        </svg>

        <svg v-show="sort_order === 'desc'" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M8 4l4-4 4 4" stroke="currentColor" fill="currentColor" />
          <path d="M8 20l4 4 4-4" stroke="currentColor" fill="none" />
        </svg>
      </button>
    </div>
  </div>
  <!-- -------------------------------------------------
                   // keybard Shortcut UI.
----------------------------------------------------->

  <div v-if="Toggle_Keyboard_Shortcut_UI" :class="{ Show_Kdb_dialog: Show_Keyboard_Shortcut_UI }"
    class="shortcuts-modal" id="shortcutsModal">
    <!-- Overlay Backdrop -->
    <div @click="Close_kbd_UI" class="shortcuts-backdrop" id="modalBackdrop"></div>

    <!-- Modal Container -->
    <div class="shortcuts-container">
      <!-- Header -->
      <div class="shortcuts-header">
        <h2><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h2>
        <button @click="Close_kbd_UI" class="close-shortcuts" id="closeButton">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="shortcuts-content">

        <!-- 1. Essentials -->
        <div class="shortcut-category essentials">
          <h3><i class="fas fa-keyboard"></i> Essentials</h3>
          <div class="shortcut-items">
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-copy"></i></div>
                <span class="shortcut-text">Copy</span>
              </div>
              <div class="shortcut-keys">
                <span class="key">Ctrl</span><span class="key plus">+</span><span class="key">C</span>
              </div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-cut"></i></div>
                <span class="shortcut-text">Cut</span>
              </div>
              <div class="shortcut-keys">
                <span class="key">Ctrl</span><span class="key plus">+</span><span class="key">X</span>
              </div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-paste"></i></div>
                <span class="shortcut-text">Paste</span>
              </div>
              <div class="shortcut-keys">
                <span class="key">Ctrl</span><span class="key plus">+</span><span class="key">V</span>
              </div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-paste"></i></div>
                <span class="shortcut-text">Paste without formatting</span>
              </div>
              <div class="shortcut-keys">
                <span class="key">Ctrl</span><span class="key plus">+</span><span class="key">Shift</span><span
                  class="key plus">+</span><span class="key">V</span>
              </div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-undo"></i></div>
                <span class="shortcut-text">Undo</span>
              </div>
              <div class="shortcut-keys">
                <span class="key">Ctrl</span><span class="key plus">+</span><span class="key">Z</span>
              </div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-redo"></i></div>
                <span class="shortcut-text">Redo</span>
              </div>
              <div class="shortcut-keys">
                <span class="key">Ctrl</span><span class="key plus">+</span><span class="key">Shift</span><span
                  class="key plus">+</span><span class="key">Z</span>
              </div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-level-down-alt"></i></div>
                <span class="shortcut-text">Line break</span>
              </div>
              <div class="shortcut-keys">
                <span class="key">Shift</span><span class="key plus">+</span><span class="key">Enter</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Text Formatting -->
        <div class="shortcut-category basic">
          <h3><i class="fas fa-font"></i> Text Formatting</h3>
          <div class="shortcut-items">
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-bold"></i></div>
                <span class="shortcut-text">Bold</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">B</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-italic"></i></div>
                <span class="shortcut-text">Italic</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">I</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-underline"></i></div>
                <span class="shortcut-text">Underline</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">U</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-strikethrough"></i></div>
                <span class="shortcut-text">Strikethrough</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Shift</span><span class="key plus">+</span><span class="key">S</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-highlighter"></i></div>
                <span class="shortcut-text">Highlight</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Shift</span><span class="key plus">+</span><span class="key">H</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-code"></i></div>
                <span class="shortcut-text">Inline Code</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">E</span></div>
            </div>
          </div>
        </div>

        <!-- 3. Structure -->
        <div class="shortcut-category structure">
          <h3><i class="fas fa-layer-group"></i> Structure</h3>
          <div class="shortcut-items">
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-heading"></i></div>
                <span class="shortcut-text">Heading 1</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Alt</span><span class="key plus">+</span><span class="key">1</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-heading"></i></div>
                <span class="shortcut-text">Heading 2</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Alt</span><span class="key plus">+</span><span class="key">2</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-heading"></i></div>
                <span class="shortcut-text">Heading 3</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Alt</span><span class="key plus">+</span><span class="key">3</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-heading"></i></div>
                <span class="shortcut-text">Heading 4</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Alt</span><span class="key plus">+</span><span class="key">4</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-heading"></i></div>
                <span class="shortcut-text">Heading 5</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Alt</span><span class="key plus">+</span><span class="key">5</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-heading"></i></div>
                <span class="shortcut-text">Heading 6</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Alt</span><span class="key plus">+</span><span class="key">6</span></div>
            </div>
            <!-- Add H3 to H6 the same way if you want, or stop at H3 for brevity -->
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-quote-right"></i></div>
                <span class="shortcut-text">Blockquote</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Shift</span><span class="key plus">+</span><span class="key">B</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-code"></i></div>
                <span class="shortcut-text">Code Block</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Alt</span><span class="key plus">+</span><span class="key">C</span></div>
            </div>
          </div>
        </div>

        <!-- 4. Lists -->
        <div class="shortcut-category lists">
          <h3><i class="fas fa-list-ul"></i> Lists</h3>
          <div class="shortcut-items">
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-list-ul"></i></div>
                <span class="shortcut-text">Bullet List</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Shift</span><span class="key plus">+</span><span class="key">8</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-list-ol"></i></div>
                <span class="shortcut-text">Ordered List</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Shift</span><span class="key plus">+</span><span class="key">7</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-tasks"></i></div>
                <span class="shortcut-text">Task List</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Shift</span><span class="key plus">+</span><span class="key">9</span></div>
            </div>
          </div>
        </div>

        <!-- 5. Alignment -->
        <div class="shortcut-category alignment">
          <h3><i class="fas fa-align-left"></i> Alignment</h3>
          <div class="shortcut-items">
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-align-left"></i></div>
                <span class="shortcut-text">Left Align</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Shift</span><span class="key plus">+</span><span class="key">L</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-align-center"></i></div>
                <span class="shortcut-text">Center Align</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Shift</span><span class="key plus">+</span><span class="key">E</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-align-right"></i></div>
                <span class="shortcut-text">Right Align</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Shift</span><span class="key plus">+</span><span class="key">R</span></div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-align-justify"></i></div>
                <span class="shortcut-text">Justify</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Shift</span><span class="key plus">+</span><span class="key">J</span></div>
            </div>
          </div>
        </div>

        <!-- 6. Utilities -->
        <div class="shortcut-category utilities">
          <h3><i class="fas fa-tools"></i> Utilities</h3>
          <div class="shortcut-items">
            <div class="shortcut-item">
              <div class="shortcut-description">
                <div class="shortcut-icon"><i class="fas fa-save"></i></div>
                <span class="shortcut-text">Save Note</span>
              </div>
              <div class="shortcut-keys"><span class="key">Ctrl</span><span class="key plus">+</span><span
                  class="key">Enter</span></div>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="shortcuts-footer">
        Press <kbd>Esc</kbd> or click outside the modal to close
      </div>
    </div>
  </div>

  <!-- --------------------------------------------- -->
  <!-- --------------------------------------------- -->
</template>

<script setup>
import draggable from 'vuedraggable'
//
import { getDatabase, acquireDBLock, releaseDBLock, validateDatabase, closeDatabase, ensureDatabase } from "./components/Database";
//
import { ref, toRaw, onMounted, onUnmounted, computed, onBeforeUnmount, nextTick, reactive, watch } from "vue";
//
import validator from 'validator';

//
import {
  Editor_Media_Adding_Parser,
  runAnimation,
  Animation_Smoother_For_Edit_And_View_Mode,
  Animate_Visiual_Block_View,
  run_visiual_block_animation,
  Clear_Editor_KeyPress_Media_Selection,
  Opening_note_In_view_mode_completed,
} from "./components/Editor_Live_Media_Adding_Parser";

import { cleanupMediaListeners } from './components/Media_Custom_Tiptap_Node/Media_Node_View'

import {
  Tiptap_Editor,
  editor,
  View_Note_Page_UI,
  commands,
  isActive,
  Show_Create_Edit_Model_Warning,
  Attachment_Capacity_Violation_Toggle_Message,
  Note_Attachment_Limit_Warning_Message,
  currentHeading,
  isFontSizeActive,
  currentFontSize,
  isLineHeightActive,
  currentLineHeight,
  isTextAlignActive,
  currentTextAlign,
  Is_Block_Background_Color_Active,
  setManageMediaMethod,
  Is_Table_Cell_Background_Color_Active,
  Is_Font_Color_Active,
  Read_mode_copy_success,
} from "./components/TipTap_Editor"; // Your new file from last response
//
import {
  Bubble_Menu,
  Modify_By_AI,
  prompt_input,
  Show_prompt_input_dialog,
  shouldShowBubbleMenu,
  prompt_dialog_input_ref,
  bubbleMenuOptions,
  Is_AI_Edit_Started,
  Stop_AI_Generation,
  Open_dialog,
  applyPrompt,
  AI_Generation_Status
} from './components/AI_Feature'
//
import { EditorContent } from "@tiptap/vue-3"; // The component
import { BubbleMenu } from "@tiptap/vue-3/menus"; // The component

// Utilities
import { debugError } from "./components/Global_Error_Handler";
import Dexie from "dexie";
import debounce from 'lodash/debounce';
import slugify from "slugify";
import { exportNoteAsPdf } from "./components/Simple_Pdf_maker";
import { highlightHTMLBlock } from "./components/MarkDown_It";

//
import {
  controller,
  resetController,
  Cancel_Operation,
} from "./components/controller";

// media
import Create_Edit_Btn from "./assets/effects/Create_Edit_Btn.mp3";
import Delete_Note_Btn from "./assets/effects/Delete_Note_Btn.mp3";
import Done_Btn from "./assets/effects/Done_Btn.wav";
import View_Btn from "./assets/effects/View_Btn.mp3";
import Close_Btn from "./assets/effects/Close_Btn.mp3";
import {
  editorLenis,
  editorRafId,
  viewLenis,
  viewRafId,
  initializeLenisScroll,
  handleEditorKeyboardScroll,
  resize_lenis_scroll_On_media_Adition,
  handleViewKeyboardScroll,
} from "./components/Scroll_Logic";

import { buildHead } from "./scripts/headBuilder";
import { useHead } from "@unhead/vue";
import { Paste_Procssing } from "./components/Paste_Drag_Drop_Handler";
import json from './assets/Seed_Note/Seed.json'
import { Note } from './assets/Seed_Note/Seed.js'
import { useTouchDetection, waitForKeyboardClose } from './components/Is_Touch';
import { getRealFileInfo } from './components/File_Type_Checker';
import { Handle_OCR, OCR_Processing, OCR_Status, Stop_OCR } from './components/OCR';
import { currentTimeDisplay, isPlaying, playbackRate, playbackRate_Speeds, seek, Show_TTS_Player, stopEverything, Toggle_Playback_dropdown, togglePause } from './components/Text_To_Speech';
import { toggleDropdown, isDropdownAnimation, menuVisible, isDropdownOpen, languages, isRecording, status, selectedLang, handleMicTapped, selectLanguage, fullyCloseSTT, toggle_prompt_Dropdown, Is_prompt_dropdown_open, Is_prompt_dropdown_animate, fully_close_prompt_STT } from './components/Speech_To_Text';
import { Render_Read_Mode_Charts } from './components/Media_Custom_Tiptap_Node/custom_visiual_block_view'
// .................................... All Variables .........................................


const { isTouchFirst } = useTouchDetection();

// User Data.
let data = ref([]);
////
let isAddBtnPressed = ref(false);
let Note_Create_Close_btn = ref();
let DisableDoneBtnElement = ref();
let CurrentIndex = ref();
let SendNoteForView_Title = ref("");
let SendNoteForView_Message = ref("");
let Is_No_Notes_Found_Message = ref(false);
let Card = ref([]);
let Note_View_UI_Text_Element = ref();
let Note_heading_element = ref();
let Note_Making_UI_Element = ref();
let note_view_ui_element = ref();
let SendImageForView = [];
let SendAudioForView = [];
let SendVideoForView = [];
let SendDocumentForView = [];
let IsRoViewNoteOpen = ref(false);
let EditMode = ref(false);
let CurrentlyWritingTitle = ref("");
let focusOnInput = ref("");
let SearchInput_Element = ref();
let inputData = ref("");
let Loading = ref(true); // loading animation
let Loading_screen_end_then_animate_notes_card_con = ref(false); // loading animation
let fileInput_tag_ref = ref();
let images = ref([]);
let AudioStorage = ref([]);
let VideoStorage = ref([]);
let DocumentStorage = ref([]);
let Edit_Mode_images = ref([]);
let Edit_Mode_AudioStorage = ref([]);
let Edit_Mode_VideoStorage = ref([]);
let Edit_Mode_DocumentStorage = ref([]); // New storage for documents

let Note_Object = {
  title: "",
  userWroteHtml: "",
  userWroteJson: null,
  NotesDate: "",
  isCardGoingDeleted: false,
  IsLoading: true,
  id: null,
  Card_Title_Color: "",
  Card_Para_Color: "",
  Card_Footer_Color: "",
  Attachment_Used_Size: null,
  TimeStamp: null,
  isFav: false,
  WorkSpaceId: null,
  SubGroupId: null,
};


let SupportedMedia = ref([
  // Video formats
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/x-matroska",
  "video/avi",
  "video/mpeg",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-flv",
  "video/x-ms-wmv",

  // Image formats
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp",
  "image/svg+xml",
  "image/apng",
  "image/heic",
  "image/heif",

  // Audio formats
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "audio/wav",
  "audio/flac",
  "audio/aac",
  "audio/x-m4a",
  "audio/webm",
  "audio/x-wav",
  "audio/x-aiff",
  "audio/x-ms-wma",
]);
/* let App_Load_Sound = new Audio(App_Load); */
let Create_Edit_Btn_Sound = new Audio(Create_Edit_Btn);
let Delete_Note_Sound = new Audio(Delete_Note_Btn);
let Done_Btn_Sound = new Audio(Done_Btn);
let View_Btn_Sound = new Audio(View_Btn);
let Close_Btn_Sound = new Audio(Close_Btn);

/* ............................. Sounds ............................ */
let temp_for_save_Create_Note_Text_if_available_parallelly = ref([]);
// Recording
let recordedChunks = ref([]);
let recordAudioButton = ref();
let recordVideoButton = ref();
let Front_Back_Camera = ref(false);
let Toggle_MarkDown_Menu = ref(false);
let videoPreview = ref();
let overlayElement = ref();
let mediaRecorder = "";
let currentStream = ""; // Store the MediaStream object
let i = 0;
let j = 0;
let Max_Accumulated_Attachments_Size_Buffer = ref(20 * 1024 * 1024);
let Max_Accumulated_Attachments_Size = ref(Max_Accumulated_Attachments_Size_Buffer.value);
// ──────────────────────────────────────────────────────────────
// TEXT FILE LIMITS (recommended for Tiptap + rich media notes)
// ──────────────────────────────────────────────────────────────
const MAX_TEXT_SIZE_HARD = 500 * 1024;
const MAX_TEXT_SIZE_WARNING = 300 * 1024;
const LARGE_TEXT_THRESHOLD = 100 * 1024;
const MAX_ALLOWED_LINES = 6500;
////
let Remove_Loading_Screen = ref(true); // import from editor and attach to view ui tag
/* let View_Note_Page_UI = ref(); */ let Newly_Created_Notes_Id_For_Backend_To_Avoid_Send_Them_During_pagination = ref(
  []
);
let More_Notes_Are_Coming = ref(false);
let All_Notes_Loaded_Message_Container_Element = ref(false);
let Fetch_Notes_In_Parts = ref({ Start_From_Note: 1, Fetch_Till_Note: 5 });
let Toggle_Critical_Error = ref(false);
let Critical_Error_Message = ref();
let Save_The_Create_Notes_Max_Accu_Attachment_Capacity_While_Switching_To_Edit_Note = ref(); //we pass controller as arg to fetch method and bakcned accept it as cancilation token parameter so useful when we reload or call conroller.abort then fetch will stop and throw error which will catched by catch block and http line will get closed and backend cancellation token will get expired and backend stop all operations where we setted that token.
let Media = ref({
  Video_Stop_Duration: 31000,
  Audio_Stop_Duration: 180000,
});
let Toggle_Reading_Form_Full_Screen = ref(false);
let Total_Storage_Capacity = ref(null);
let Used_Storage_Capacity = ref(null);
let Used_Storage_Capacity_Percentage = ref(null);
let Used_Storage_Capacity_Element = ref();
let sort_order = ref("asc");
let Blur_Background_WhileOpening_Note = ref(false);
const bg = ["#131313", "rgb(74 109 169)", "green", "#e2e2e2"];
const clr = ["#979797", "#dbdbdb", "white", "black"];
const colorIndex = ref(0);
let Alignment_index = ref(0);
let align_properties_arr = ref(["left", "center", "right"]);
let Is_Audio_Recording = ref(false);
let Is_Video_Recording = ref(false);
let toggle_delete_model = ref(false);
let Is_Sticky_Colorful_Card = ref(false);
let All_Notes_loaded_Element = ref();
let disable_color_notes_switcher_btn = ref(true);
let Is_Front_Camera_In_Use = ref(false);
let Is_FlashLight_Supported = ref(false);
let Is_FlashLight_On = ref(false);
let flash_light_btn_element = ref();
let Current_Video_Stream_Track = ref();
let Is_Video_Mirroring = ref(false);
let supportedMime = ref("");
let Each_Note_Preview = ref();
let Observer;
const db = getDatabase();

const refreshKey = ref(new Date().toISOString());


// Styling Buttons
let Toggle_Heading = ref(false);
let Toggle_Font_Size = ref(false);
let Toggle_Line_Spacing = ref(false);
let Toggle_Text_Alignment = ref(false);
let Toggle_link = ref(false);
let link = ref({ url: "" });
let Toggle_Font_Color = ref(false);
let Toggle_Highlight_Color = ref(false);
let Toggle_Block_Background_Color = ref(false);
let Toggle_Table_Cell_Background_Color = ref(false);
let Toggle_Table_Menu = ref(false);
let Toggle_Mobile_View = ref(false);

// Font Color Btns
let Font_Color_Picker_El = ref();
let Font_Color_Opacity_Slider_El = ref();
let Font_Color_Preview_El = ref();
// Highlight Btns
let Highlight_Color_Picker_El = ref();
let Highlight_Color_Opacity_Slider_El = ref();
let Highlight_Color_Preview_El = ref();
// Block_BG_Color Btns
let Block_BG_Color_Picker_El = ref();
let Block_BG_Color_Opacity_Slider_El = ref();
let Block_BG_Color_Preview_El = ref();
//
let Table_Cell_BG_Color_Picker_El = ref();
let Table_Cell_BG_Color_Opacity_Slider_El = ref();
let Table_Cell_BG_Color_Preview_El = ref();
////////////////
let Toggle_Table = ref(false);
let Table_Input = ref({
  rows: 3,
  columns: 3,
});
//
let Styling_Btns_Toolbar = ref();
let Table_Styling_Btns_Toolbar = ref();

// DropDown Supported Styling Btns element ref
let HeadingBtn = ref();
let Font_Size_Btn = ref();
let Line_Spacing_Btn = ref();
let Text_Alignment_Btn = ref();
let Link_Btn = ref();
let Font_Color_Btn = ref()
let Font_Highlight_Btn = ref();
let Block_BG_Color_Btn = ref();
let Table_Btn = ref();
let Table_Cell_BG_Color_Btn = ref();

// Styling Btns element ref
let BoldBtn = ref();
let ItalicBtn = ref();
let CodeBtn = ref();
///
let Show_Choice_Dialog = ref(false);
let Show_Type_Dialog = ref(false);
let Selected_Type = ref(false);
let Show_Overlay = ref(false);
let Show_Url_Dialog = ref(false);
let Media_Url = ref("");
let Media_Name = ref("");

// Keyboard Toggles
let Toggle_Keyboard_Shortcut_UI = ref(false);
let Show_Keyboard_Shortcut_UI = ref(false);
// two managers for manage Kbd Toggle timings
const scheduleOpen = useToggleTimer();
const scheduleClose = useToggleTimer();

//////////////////////////////////////////////////////////////////////////////////////////
// ALL Methods
//////////////////////////////////////////////////////////////////////////////////////////

const pdfMenuOpen = ref(false);
const pdfBtnRef = ref(null);
const pdfSubRef = ref(null);
const pdfSubmenuStyle = ref({ position: 'absolute', top: '0px', left: '0px', zIndex: 20050 });

function closePdfMenu() {
  pdfMenuOpen.value = false;
}

async function togglePdfMenu(e) {
  pdfMenuOpen.value = !pdfMenuOpen.value;
  if (pdfMenuOpen.value) {
    await nextTick();
    positionPdfSubmenu();
    // close on outside click
    document.addEventListener('click', outsidePdfClick);
    window.addEventListener('resize', closePdfMenu);
    window.addEventListener('scroll', positionPdfSubmenu, { passive: true });
  } else {
    cleanupPdfListeners();
  }
}

function positionPdfSubmenu() {
  const btn = pdfBtnRef.value;
  const sub = pdfSubRef.value;
  if (!btn || !sub) return;
  const rect = btn.getBoundingClientRect();
  // place submenu under the button, but keep in viewport
  const top = rect.bottom + 6 + window.scrollY;
  let left = rect.right - sub.offsetWidth + window.scrollX;
  // clamp to viewport
  if (left + sub.offsetWidth > window.scrollX + window.innerWidth - 8) {
    left = window.scrollX + window.innerWidth - sub.offsetWidth - 8;
  }
  if (left < window.scrollX + 8) left = window.scrollX + 8;
  pdfSubmenuStyle.value.top = `${top}px`;
  pdfSubmenuStyle.value.left = `${left}px`;
  pdfSubmenuStyle.value.position = 'absolute';
  pdfSubmenuStyle.value.zIndex = 20050;
}

function outsidePdfClick(e) {
  if (!pdfSubRef.value?.contains(e.target) && !pdfBtnRef.value?.contains(e.target)) {
    closePdfMenu();
    cleanupPdfListeners();
  }
}

function cleanupPdfListeners() {
  document.removeEventListener('click', outsidePdfClick);
  window.removeEventListener('resize', closePdfMenu);
  window.removeEventListener('scroll', positionPdfSubmenu);
}

// cleanup on unmount
onBeforeUnmount(() => {
  cleanupPdfListeners();
});


// ==================== FILTER STATE ====================
const activeFilter = ref({
  type: 'all',           // 'all' | 'favorites' | 'workspace' | 'subgroup'
  workspaceId: null,
  subgroup: null
});


// Writable computed - this is what vuedraggable will use
const visibleNotes = computed({
  get() {
    const f = activeFilter.value
    return data.value.filter(note => {
      if (f.type === 'all') return true
      if (f.type === 'favorites') return !!note.isFav
      if (f.type === 'workspace') return note.WorkSpaceId === f.workspaceId
      if (f.type === 'subgroup') {
        return note.WorkSpaceId === f.workspaceId && note.SubGroupId === f.subgroup
      }
      return true
    })
  },

  // This runs when user drags → we reorder the real `notes` array
  set(newOrderedList) {
    const orderMap = new Map(newOrderedList.map((note, i) => [note.id, i]))

    data.value = data.value
      .slice()                                   // copy
      .sort((a, b) => {
        const posA = orderMap.get(a.id) ?? 9999
        const posB = orderMap.get(b.id) ?? 9999
        return posA - posB
      })
  }
});


watch(visibleNotes, (newList) => {
  Is_No_Notes_Found_Message.value = newList.length === 0
}, { immediate: true })   // immediate: true so it runs on first load too



const setFilter = (type, workspaceId = null, subgroup = null) => {
  activeFilter.value = { type, workspaceId, subgroup }
  Cancel_WorkSpace_Deletion();
  closeModal();
  if (!workspaceId && !subgroup && window.innerWidth <= 500) closeSidebar();
}


const workspaces = ref([])

const activeItem = ref(1);


const loadFromStorage = async () => {
  const allWS = await db.workSpaces.toArray();
  if (allWS.length > 0) {
    try {
      workspaces.value = allWS;
    } catch (e) {
      workspaces.value = [];
      console.log('Error while fetching workspace from storage on load', e);

    }
  }
}

let toggle_note_fotter_menu = ref(null);
let show_note_footer_menu = ref(false);


async function toggleNoteFooterMenu(id) {
  if (toggle_note_fotter_menu.value) {
    if (toggle_note_fotter_menu.value === id) await hideNoteFooterMenu();
    else {
      show_note_footer_menu.value = false;
      toggle_note_fotter_menu.value = null;
      await showNoteFooterMenu(id);
    }
  }
  else {
    await showNoteFooterMenu(id); // hide any other open menu first
  }

}

async function showNoteFooterMenu(id) {
  toggle_note_fotter_menu.value = id;
  await new Promise(resolve => setTimeout(resolve, 30));
  show_note_footer_menu.value = true;
}

async function hideNoteFooterMenu() {
  show_note_footer_menu.value = false;
  await new Promise(resolve => setTimeout(resolve, 100));
  toggle_note_fotter_menu.value = null;
}


// 🔄 Toggle favorite
async function toggleFavorite(note) {
  try {
    let noteId = note.id;
    await db.transaction("rw", db.favorites, async () => {
      const fav = await db.favorites.get(noteId);
      if (fav) {
        note.isFav = false;
        await db.favorites.delete(noteId);
      } else {
        note.isFav = true;
        await db.favorites.put({ id: noteId });
      }
    });
    return true; // success
  } catch (err) {
    console.error("Toggle favorite failed:", err);
    return false;
  }
}


/* =============================================
   STATE (Composition API - latest Vue 3 pattern)
   ============================================= */
const sidebarOpen = ref(false)

const showModal = ref(false)
const modalTitle = ref('New Workspace')
const editingWorkspaceId = ref(null)
const wsName = ref('')
const selectedColor = ref('#4B3B60')
const tempSubgroups = ref([])
const newSubgroup = ref('')
const confirmingId = ref(null) // For two-step delete confirmation
const expandedStates = reactive({})

/* Color palette (exact original) */
const colorOptions = [
  { name: 'Coral', code: '#FF6B6B' },
  { name: 'Lavender', code: '#B185DB' },
  { name: 'Sky', code: '#4D9DE0' },
  { name: 'Mint', code: '#3BB273' },
  { name: 'Amber', code: '#F9A03F' },
  { name: 'Rose', code: '#E84855' },
  { name: 'Indigo', code: '#4B3B60' },
  { name: 'Teal', code: '#1F7A8C' }
]

/* Computed for selected color label (reactive, no manual DOM updates) */
const selectedColorName = computed(() => {
  const found = colorOptions.find(opt => opt.code === selectedColor.value)
  return found ? found.name : ''
})

/* =============================================
   LIFECYCLE & STORAGE
   ============================================= */
onMounted(() => {
  loadFromStorage();
})

/* =============================================
   SIDEBAR CONTROLS (fluid slide animation preserved)
   ============================================= */
const openSidebar = () => {
  View_Btn_Sound.play();
  sidebarOpen.value = true;
}

const closeSidebar = () => {
  if (sidebarOpen.value) {
    Close_Btn_Sound.play();
    sidebarOpen.value = false;
  }
}

/* =============================================
   MODAL CONTROLS (scale + fade preserved + reactive)
   ============================================= */
let workspace_input_toggle = ref({
  name: false,
  SubGroup: false,
});

const openNewModal = async () => {
  try {
    editingWorkspaceId.value = null
    modalTitle.value = 'New Workspace'
    wsName.value = ''
    selectedColor.value = '#4B3B60'
    tempSubgroups.value = []
    newSubgroup.value = ''
    Cancel_WorkSpace_Deletion();

    if (window.innerWidth <= 1100) closeSidebar(); // auto-close sidebar on mobile when opening modal
    await new Promise(resolve => setTimeout(resolve, 100));
    showModal.value = true
  }
  catch (e) {
    console.error('Error opening new workspace modal:', e);
    alert('Failed to open new workSpace modal. Please try again.');
  }
}


let Editing_Workspace = ref(false);

const openEditModal = async (ws) => {
  try {
    editingWorkspaceId.value = ws.id
    modalTitle.value = 'Edit Workspace'
    wsName.value = ws.name
    selectedColor.value = ws.color
    tempSubgroups.value = [...(ws.subgroups || [])]
    newSubgroup.value = ''
    Cancel_WorkSpace_Deletion();

    if (window.innerWidth <= 1100) closeSidebar(); // auto-close sidebar on mobile when opening modal
    await new Promise(resolve => setTimeout(resolve, 100));

    Editing_Workspace.value = true;
    showModal.value = true
  } catch (e) {
    console.error('Error opening edit modal:', e);
    alert('Failed to open workSpace edit modal. Please try again.');
  }
}

const closeModal = () => {
  Delete_Select.value = null;
  if (Sub_Group_Collection_For_Deletion.value && Sub_Group_Collection_For_Deletion.value.length > 0) {
    for (const sg_obj of Sub_Group_Collection_For_Deletion.value) {
      const obj = tempSubgroups.value[sg_obj.deletion_index];
      obj.soft_deletion = false;
      obj.hard_deletion = false;
    }
  }
  Sub_Group_Collection_For_Deletion.value = [];
  Editing_Workspace.value = false;
  showModal.value = false;
}

let ws_input_empty_timeout = null;
async function saveWorkspace() {
  try {
    const input_sub_group = newSubgroup.value.trim();
    if (input_sub_group) addTempSubgroup(); // add any pending subgroup before saving

    if (ws_input_empty_timeout) {
      clearTimeout(ws_input_empty_timeout);
      ws_input_empty_timeout = null;
    }
    const name = wsName.value.trim()
    let ws;
    if (!name) {
      workspace_input_toggle.value.name = true;
      // set timeout of .2s to off the name
      ws_input_empty_timeout = setTimeout(() => workspace_input_toggle.value.name = false, 2000);
      return
    }

    // sort deletion collection by index descending
    if (Sub_Group_Collection_For_Deletion.value && Sub_Group_Collection_For_Deletion.value.length > 0) {
      const deletions = [...Sub_Group_Collection_For_Deletion.value]
        .sort((a, b) => b.deletion_index - a.deletion_index)

      for (const sg_obj of deletions) {
        if (sg_obj.op === "hard_group_only") {
          const obj = tempSubgroups.value[sg_obj.deletion_index]

          // delete notes belonging to this subgroup
          for (const note of [...data.value]) {
            if (note.SubGroupId === obj.name) {
              const idx = data.value.findIndex(n => n.id === note.id)
              if (idx !== -1) {
                await DeleteNote(note.id)
                data.value.splice(idx, 1)
              }
            }
          }

        }
        // safe because we’re going backwards
        tempSubgroups.value.splice(sg_obj.deletion_index, 1)
      }
      Sub_Group_Collection_For_Deletion.value = [];
    }


    if (editingWorkspaceId.value) {
      // Edit existing
      ws = workspaces.value.find(w => w.id === editingWorkspaceId.value)
      if (ws) {
        ws.name = name
        ws.color = selectedColor.value
        ws.subgroups = tempSubgroups.value.map(sub => toRaw(sub))
      }
    } else {
      // Create new
      ws = {
        id: 'ws_' + Date.now(),
        name,
        color: selectedColor.value,
        subgroups: tempSubgroups.value.map(sub => toRaw(sub))
      }
    }
    if (ws) {
      const idx = workspaces.value.findIndex(w => w.id === ws.id);
      if (idx !== -1) {
        // replace existing
        workspaces.value[idx] = ws;
      } else {
        workspaces.value.push(ws);
      }
      await db.workSpaces.put(toRaw(ws));
    }
    closeModal();
  } catch (e) {
    console.error('Error saving workspace:', e);
    alert('Failed to save workspace. Please try again.');
  }
}

/* =============================================
   SUB-GROUP HANDLERS when making new workspace item and add groups in it.
   ============================================= */

let workspace_subgroup_input_timeOut = null;
const addTempSubgroup = () => {
  if (workspace_subgroup_input_timeOut) {
    clearTimeout(workspace_subgroup_input_timeOut);
    workspace_subgroup_input_timeOut = null;
  }
  try {
    const val = newSubgroup.value.trim()
    if (!val) {
      workspace_input_toggle.value.SubGroup = true;
      workspace_subgroup_input_timeOut = setTimeout(() => workspace_input_toggle.value.SubGroup = false, 2000);
      return
    }
    tempSubgroups.value.push({ "name": val, "soft_deletion": false, "hard_deletion": false });
    newSubgroup.value = ''
  }
  catch (e) {
    console.error('Error adding subgroup:', e);
    alert('Failed to add subgroup. Please try again.');
  }
}

let Delete_Select = ref(null);
let Sub_Group_Collection_For_Deletion = ref([]);

const removeSubgroup = (idx) => {
  Delete_Select.value = idx;
  /* tempSubgroups.value.splice(idx, 1) */
}

function remove_only_Subgroup(sg_deletion) {
  let sg_obj = tempSubgroups.value[Delete_Select.value];
  if (sg_deletion === "soft") {
    sg_obj.soft_deletion = true;
    sg_obj.hard_deletion = false;
  }
  else {
    sg_obj.soft_deletion = true;
    sg_obj.hard_deletion = true;
  }
  Sub_Group_Collection_For_Deletion.value.push({ "deletion_index": Delete_Select.value, "op": `${sg_deletion}_group_only` });
}

function Cancel_Delete_Subgroup() {
  Delete_Select.value = null;
}

/* =============================================
   WORKSPACE LIST HELPERS (performance-optimized)
   ============================================= */
const toggleExpanded = (id) => {
  // Toggle boolean (undefined → true, true → false, false → true)
  expandedStates[id] = !expandedStates[id]
}

const handleRowClick = (ws) => {
  if (ws.subgroups?.length > 0) {
    toggleExpanded(ws.id)
  }
}

/* =============================================
   DELETE WITH TWO-STEP CONFIRMATION (exact original UX)
   ============================================= */
const startDelete = (wsId) => {
  confirmingId.value = wsId;
  closeModal();
}

const cancelConfirm = () => {
  confirmingId.value = null;
  Toggle_WorkSpace_Delete_Confirmation.value = false;
}

let Toggle_WorkSpace_Delete_Confirmation = ref(false);



let Total_Sub_Groups_To_Be_Deleted = ref(0);
let Total_Linked_Notes_To_Be_Deleted = ref(0);


const confirmDelete = async () => {
  try {
    if (!confirmingId.value) return

    if (window.innerWidth <= 1000) {
      closeSidebar();
    }

    Toggle_WorkSpace_Delete_Confirmation.value = true;

    const index = workspaces.value.findIndex(w => w.id === confirmingId.value)
    if (index !== -1) {
      const wsId = workspaces.value[index].id;
      // count total number of sub groups and linked notes to WS and its sub groups for progress bar in deletion confirmation modal
      Total_Sub_Groups_To_Be_Deleted.value = workspaces.value[index].subgroups ? workspaces.value[index].subgroups.length : 0;
      Total_Linked_Notes_To_Be_Deleted.value = data.value.filter(note => note.WorkSpaceId === wsId).length;
    }
  }
  catch (e) {
    console.error('Error during workspace deletion:', e);
    alert('Failed to delete workspace. Please try again.');
  }
}



function Cancel_WorkSpace_Deletion() {
  Toggle_WorkSpace_Delete_Confirmation.value = false;
  confirmingId.value = null;
}




async function Delete_WorkSpace_And_Associated_Notes(deletion) {
  try {
    const index = workspaces.value.findIndex(w => w.id === confirmingId.value)
    if (index !== -1) {

      // Delete associated notes
      if (deletion === "hard") {
        for (const note of data.value) {
          if (note.WorkSpaceId === confirmingId.value) {
            await DeleteNote(note.id)
          }
        }
        data.value = data.value.filter(n => n.WorkSpaceId !== confirmingId.value)
      }


      // Delete workspace
      workspaces.value.splice(index, 1);
      await db.workSpaces.delete(confirmingId.value);
    }
    Total_Sub_Groups_To_Be_Deleted.value = 0;
    Total_Linked_Notes_To_Be_Deleted.value = 0;
    confirmingId.value = null;
    Toggle_WorkSpace_Delete_Confirmation.value = false;
  } catch (e) {
    console.error('Error deleting workspace and notes:', e);
    alert('Failed to delete workspace and its notes. Please try again.');
  }
}



// Workspace Selection linked to note Modal Logic

// NEW: Workspace Selector Modal
const showWorkspaceSelector = ref(false)
const tempSelectedWorkspaceId = ref(null)
const tempSelectedSubgroup = ref(null)
let workspaceSelectorCard = ref();
const tempSelectedSubgroupIndex = ref(0) // 0 = "None", 1+ = actual subgroups

// Computed for current subgroups
const tempCurrentSubgroups = computed(() => {
  const ws = workspaces.value.find(w => w.id === tempSelectedWorkspaceId.value)
  return ws?.subgroups ?? []
})


const workspaceSelectorItems = computed(() => [
  { id: null, name: 'No Workspace' },
  ...workspaces.value.map(ws => ({ id: ws.id, name: ws.name }))
]);

const selectedWorkspaceIndex = computed(() => {
  const idx = workspaceSelectorItems.value.findIndex(item => item.id === tempSelectedWorkspaceId.value);
  return idx === -1 ? 0 : idx;
});


// Create Note Button Handler (replace your old + button click)
async function Create_Edit_Note_By_WorkSpace(id, Its_Edit_Mode = false) {
  closeSidebar();
  let index = 0;

  if (id) index = data.value.findIndex(n => n.id === id) // index

  // set time out of 300 for focus on workspace card
  setTimeout(() => workspaceSelectorCard.value?.focus(), 300);

  if (workspaces.value.length === 0) {
    //
    if (Its_Edit_Mode) {
      hideNoteFooterMenu();
      EditBtn(index);
    }
    else
      AddNoteBtn();
    //
  } else {
    if (Its_Edit_Mode) {
      CurrentIndex.value = index
      EditMode.value = true;
    }
    // Show selector
    if (Its_Edit_Mode && data.value[index]?.WorkSpaceId)
      tempSelectedWorkspaceId.value = data.value[index].WorkSpaceId;
    else
      tempSelectedWorkspaceId.value = null

    if (Its_Edit_Mode && data.value[index]?.SubGroupId) {
      tempSelectedSubgroup.value = data.value[index].SubGroupId;

      const ws = workspaces.value.find(w => w.id === tempSelectedWorkspaceId.value);
      const subgroupIndex = ws?.subgroups?.findIndex(sub => sub.name === data.value[index].SubGroupId) ?? -1;
      tempSelectedSubgroupIndex.value = subgroupIndex >= 0 ? subgroupIndex + 1 : 0;
    }
    else
      tempSelectedSubgroup.value = null;

    showWorkspaceSelector.value = true;
  }
}


function moveWorkspaceSelection(direction) {
  const items = workspaceSelectorItems.value;
  if (!items.length) return;

  let nextIndex = selectedWorkspaceIndex.value + direction;
  if (nextIndex < 0) nextIndex = items.length - 1;
  if (nextIndex >= items.length) nextIndex = 0;

  tempSelectedWorkspaceId.value = items[nextIndex].id;
  tempSelectedSubgroup.value = null;
}


function moveSubgroupSelection(direction) {
  if (!tempSelectedWorkspaceId.value) return; // Only if workspace is selected

  const totalItems = 1 + tempCurrentSubgroups.value.length; // 1 (None) + subgroups
  let nextIndex = tempSelectedSubgroupIndex.value + direction;

  if (nextIndex < 0) nextIndex = totalItems - 1;
  if (nextIndex >= totalItems) nextIndex = 0;

  tempSelectedSubgroupIndex.value = nextIndex;

  // Update the name based on index
  if (nextIndex === 0) {
    tempSelectedSubgroup.value = null;
  } else {
    tempSelectedSubgroup.value = tempCurrentSubgroups.value[nextIndex - 1]?.name || null;
  }
}


let selectedWorkspaceId = ref(null);
let selectedSubgroup = ref(null);

// Confirm selection and open note modal
const confirmWorkspaceSelection = () => {
  selectedWorkspaceId.value = tempSelectedWorkspaceId.value
  selectedSubgroup.value = tempSelectedSubgroup.value || null

  showWorkspaceSelector.value = false

  if (EditMode.value)
    EditBtn(CurrentIndex.value);
  else
    AddNoteBtn();

}

const cancelWorkspaceSelection = () => {
  showWorkspaceSelector.value = false;
  if (EditMode.value) EditMode.value = false;
  tempSelectedWorkspaceId.value = null;
  tempSelectedSubgroup.value = null;
  tempSelectedSubgroupIndex.value = 0 // Reset to "None"
}

const selectWorkspaceTemp = (id) => {
  tempSelectedWorkspaceId.value = id
  tempSelectedSubgroup.value = null
  tempSelectedSubgroupIndex.value = 0 // Reset to "None"
}





// single timeout manager
function useToggleTimer() {
  let timer = null;

  return function schedule(fn, delay) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn();
      timer = null;
    }, delay);
  };
}

function Render_kbd_UI() {
  try {
    if (!Toggle_Keyboard_Shortcut_UI.value) {
      Toggle_Keyboard_Shortcut_UI.value = true;
      scheduleOpen(() => {
        Show_Keyboard_Shortcut_UI.value = true;
      }, 10);
    } else {
      Close_kbd_UI();
    }
  } catch (error) {
    console.log(error.stack);
    debugError(error, "Method");
  }
}

function Close_kbd_UI() {
  try {
    Show_Keyboard_Shortcut_UI.value = false;
    scheduleClose(() => {
      Toggle_Keyboard_Shortcut_UI.value = false;
    }, 400);
  } catch (error) {
    console.log(error.stack);
    debugError(error, "Method");
  }
}


function Validate_Url(url) {
  if (typeof url !== 'string' || url.length < 10 || url.length > 4096) {
    return false;
  }

  const trimmed = url.trim();
  if (!trimmed) return false;

  return validator.isURL(trimmed, {
    protocols: ['http', 'https'],
    require_tld: true,           // Rejects https://com
    require_protocol: true,      // Must have http/https
    require_host: true,
    allow_underscores: false,
    allow_trailing_dot: false,
    disallow_auth: true,         // Block http://user:pass@site.com
    host_whitelist: false,       // You can add specific hosts if needed
  });
}

function Apply_Link() {
  if (!link.value.url || link.value.url.trim() === "") {
    Show_Create_Edit_Model_Warning('URL cannot be empty!', 3000);
    return;
  } else if (!Validate_Url(link.value.url)) {
    Show_Create_Edit_Model_Warning('Invalid URL format!', 3000);
  } else {
    commands.setLink(link.value.url);
    Toggle_link.value = false;
    link.value.url = '';
  }
}


function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


function getRgbaForSource(source) {
  const picker = source === 'font'
    ? Font_Color_Picker_El
    : source === 'table_cell_bg'
      ? Table_Cell_BG_Color_Picker_El
      : source === 'block_bg'
        ? Block_BG_Color_Picker_El
        : Highlight_Color_Picker_El;

  const slider = source === 'font'
    ? Font_Color_Opacity_Slider_El
    : source === 'table_cell_bg'
      ? Table_Cell_BG_Color_Opacity_Slider_El
      : source === 'block_bg'
        ? Block_BG_Color_Opacity_Slider_El
        : Highlight_Color_Opacity_Slider_El;

  const previewEl = source === 'font'
    ? Font_Color_Preview_El
    : source === 'table_cell_bg'
      ? Table_Cell_BG_Color_Preview_El
      : source === 'block_bg'
        ? Block_BG_Color_Preview_El
        : Highlight_Color_Preview_El;

  const color = picker?.value?.value ?? '#000000';
  const opacity = (slider?.value?.value ?? 100) / 100;
  const rgba = hexToRgba(color, opacity);
  return { color, opacity, rgba, previewEl };
}

function Update_Color_Picker_Preview(source) {
  const { rgba, previewEl } = getRgbaForSource(source);
  if (previewEl?.value) previewEl.value.style.backgroundColor = rgba;

  if (source === 'font') {
    commands.setColor(rgba);
  } else if (source === 'table_cell_bg') {
    commands.setTableCellBackgroundColor(rgba);
  } else if (source === 'block_bg') {
    commands.toggle_block_bg(rgba);
  } else {
    commands.setHighlight(rgba);
  }
}

function Apply_Color_To_Selected_Element(source) {
  const { rgba } = getRgbaForSource(source);
  if (!rgba) return;

  if (source === 'font') {
    commands.setColor(rgba);
  } else if (source === 'table_cell_bg') {
    commands.setTableCellBackgroundColor(rgba);
  } else if (source === 'block_bg') {
    commands.toggle_block_bg(rgba);
  } else {
    commands.setHighlight(rgba);
  }

  if (Tiptap_Editor?.commands?.focus) Tiptap_Editor.commands.focus();
}




function Settings_Style_Btns_Drop_Down_Menus(event, Source, template_btn_OR_Ref_btn) {
  const button = template_btn_OR_Ref_btn == 'ref_btn' ? event.value : event.currentTarget; // the button itself
  const dropdown = button.parentElement.querySelector('.Styling_Btn_Levels'); // the dropdown menu
  const buttonRect = button.getBoundingClientRect();
  const buttonLeft = buttonRect.left;
  const buttonWidth = buttonRect.width;
  const buttonBottom = buttonRect.bottom;
  const dropdownWidth = dropdown.offsetWidth;
  const dropdownHeight = dropdown.offsetHeight;
  let dropdownLeft = null;
  let dropdownTop = buttonBottom; // Default to below the button

  // Calculate horizontal position
  if (Source === 'Simple_DropDown') {
    dropdownLeft = buttonLeft; // Align left with button for simple dropdown
  } else {
    // Centered for normal dropdown (use / 2 for true center; adjust if needed)
    dropdownLeft = buttonLeft + (buttonWidth / 2) - (dropdownWidth / 2);
  }

  // Boundary checks to prevent going off-screen
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  if (dropdownLeft < 0) {
    dropdownLeft = 0;
  } else if (dropdownLeft + dropdownWidth > windowWidth) {
    dropdownLeft = windowWidth - dropdownWidth;
  }

  // Vertical adjustment: if not enough space below, position above
  if (buttonBottom + dropdownHeight > windowHeight) {
    dropdownTop = buttonRect.top - dropdownHeight;
    if (dropdownTop < 0) {
      dropdownTop = 0; // Fallback if no space above either
    }
  }

  // Apply positions (assuming position: fixed in CSS for dropdown to avoid clipping)
  dropdown.style.left = dropdownLeft + "px";
  dropdown.style.top = dropdownTop + "px";
}


// New function to update positions and check visibility on scroll/resize
function Toggle_Btn_And_Update_DropDown_Positions() {
  if (Toggle_Heading.value) {
    Settings_Style_Btns_Drop_Down_Menus(HeadingBtn, 'Simple_DropDown', 'ref_btn');
    Update_DropDown_On_Scroll_Or_Resize(HeadingBtn, Toggle_Heading, 'styling_btn_menu');
  }
  else if (Toggle_Font_Size.value) {
    Settings_Style_Btns_Drop_Down_Menus(Font_Size_Btn, 'Simple_DropDown', 'ref_btn');
    Update_DropDown_On_Scroll_Or_Resize(Font_Size_Btn, Toggle_Font_Size, 'styling_btn_menu');
  }
  else if (Toggle_Line_Spacing.value) {
    Settings_Style_Btns_Drop_Down_Menus(Line_Spacing_Btn, 'Simple_DropDown', 'ref_btn');
    Update_DropDown_On_Scroll_Or_Resize(Line_Spacing_Btn, Toggle_Line_Spacing, 'styling_btn_menu');
  }
  else if (Toggle_Text_Alignment.value) {
    Settings_Style_Btns_Drop_Down_Menus(Text_Alignment_Btn, 'Simple_DropDown', 'ref_btn');
    Update_DropDown_On_Scroll_Or_Resize(Text_Alignment_Btn, Toggle_Text_Alignment, 'styling_btn_menu');
  }
  else if (Toggle_link.value) {
    Settings_Style_Btns_Drop_Down_Menus(Link_Btn, 'Normal', 'ref_btn');
    Update_DropDown_On_Scroll_Or_Resize(Link_Btn, Toggle_link, 'styling_btn_menu');
  }
  else if (Toggle_Font_Color.value) {
    Settings_Style_Btns_Drop_Down_Menus(Font_Color_Btn, 'Normal', 'ref_btn');
    Update_DropDown_On_Scroll_Or_Resize(Font_Color_Btn, Toggle_Font_Color, 'styling_btn_menu');
  }
  else if (Toggle_Highlight_Color.value) {
    Settings_Style_Btns_Drop_Down_Menus(Font_Highlight_Btn, 'Normal', 'ref_btn');
    Update_DropDown_On_Scroll_Or_Resize(Font_Highlight_Btn, Toggle_Highlight_Color, 'styling_btn_menu');
  }
  else if (Toggle_Block_Background_Color.value) {
    Settings_Style_Btns_Drop_Down_Menus(Block_BG_Color_Btn, 'Normal', 'ref_btn');
    Update_DropDown_On_Scroll_Or_Resize(Block_BG_Color_Btn, Toggle_Block_Background_Color, 'styling_btn_menu');
  }
  else if (Toggle_Table.value) {
    Settings_Style_Btns_Drop_Down_Menus(Table_Btn, 'Normal', 'ref_btn');
    Update_DropDown_On_Scroll_Or_Resize(Table_Btn, Toggle_Table, 'styling_btn_menu');
  }
  else if (Toggle_Table_Cell_Background_Color.value) {
    Settings_Style_Btns_Drop_Down_Menus(Table_Cell_BG_Color_Btn, 'Normal', 'ref_btn');
    Update_DropDown_On_Scroll_Or_Resize(Table_Cell_BG_Color_Btn, Toggle_Table_Cell_Background_Color, 'table_styling_menu');
  }
}

async function Toggle_Table_Menu_To_Scroll_Event() {
  await new Promise(resolve => setTimeout(resolve, 10)); // Wait for DOM to update and refs to be available
  if (Toggle_Table_Menu.value) {
    Table_Styling_Btns_Toolbar.value.addEventListener('scroll', Toggle_Btn_And_Update_DropDown_Positions);
    Table_Styling_Btns_Toolbar.value.addEventListener('resize', Toggle_Btn_And_Update_DropDown_Positions);
  }
  else {
    Table_Styling_Btns_Toolbar.value.removeEventListener('scroll', Toggle_Btn_And_Update_DropDown_Positions);
    Table_Styling_Btns_Toolbar.value.removeEventListener('resize', Toggle_Btn_And_Update_DropDown_Positions);
  }
}

function Update_DropDown_On_Scroll_Or_Resize(btn, toggle, source) {
  const toolbarRect = source == 'styling_btn_menu' ? Styling_Btns_Toolbar.value.getBoundingClientRect() : Table_Styling_Btns_Toolbar.value.getBoundingClientRect();
  const buttonRect = btn.value.getBoundingClientRect();

  if (
    buttonRect.right < toolbarRect.left ||
    buttonRect.left > toolbarRect.right ||
    buttonRect.bottom < toolbarRect.top ||
    buttonRect.top > toolbarRect.bottom
  ) {
    toggle.value = false;
  }
}


function Show_Select_Input_Source_Selection() {
  // FIX: Kill the keyboard immediately by blurring the active element
  if (document.activeElement) {
    document.activeElement.blur();
  }
  Show_Choice_Dialog.value = true;
  Show_Overlay.value = true;
}


let Is_Select_Type_OCR = ref(false);

function chooseSource(source) {
  try {
    Show_Choice_Dialog.value = false;
    if (source === "local" || source === "OCR") {

      if (source === "OCR") Is_Select_Type_OCR.value = true;

      Show_Overlay.value = false;
      fileInput_tag_ref.value.click();
    } else {
      if (!navigator.onLine) {
        console.error("No internet connection. Cannot call AI server.");
        Show_Create_Edit_Model_Warning("You are offline. Please check your internet connection.", 3000);
        cancelDialog();
        return;
      }
      Show_Type_Dialog.value = true;
    }
  } catch (error) {
    console.log(error.stack);
    debugError(error, "Method");
  }
}

function chooseType(type) {
  try {
    Selected_Type.value = type;
    Show_Type_Dialog.value = false;
    Show_Url_Dialog.value = true;
  } catch (error) {
    console.log(error.stack);
    debugError(error, "Method");
  }
}

function cancelDialog() {
  try {
    Show_Choice_Dialog.value = false;
    Show_Type_Dialog.value = false;
    Show_Overlay.value = false;
    Show_Url_Dialog.value = false;
    Media_Url.value = "";
    Media_Name.value = "";
  } catch (error) {
    console.log(error.stack);
    debugError(error, "Method");
  }
}


let Online_Media_Object_Count = ref({
  image: 0,
  video: 0,
  audio: 0,
  document: 0,
});

async function applyDialog() {
  try {

    // Turn off the device keyboard
    if (isTouchFirst.value)
      await waitForKeyboardClose(50);
    const url = Media_Url.value;
    const name = normalizeString(Media_Name.value);

    if (!url || !Validate_Url(url) || !name) {
      Show_Create_Edit_Model_Warning("Invalid Url / Empty Input.", 3000);
      return;
    }

    let order = ++Online_Media_Object_Count.value[Selected_Type.value];

    await Editor_Media_Adding_Parser(
      Tiptap_Editor,
      order,
      `online_${Selected_Type.value}_${name}_${order}`,
      url,
      Selected_Type.value,
      '',
      '',
      'online', // source,
      false, // Is Media Pasted from Clipboard HTML
    );

    cancelDialog(); // close dialog and reset fields

  } catch (error) {
    console.log(error.stack);
    debugError(error, "Method");
  }
}


function Toggle_Note_Card_Color_Mode() {
  try {
    let msg = "";
    Is_Sticky_Colorful_Card.value = !Is_Sticky_Colorful_Card.value;
    localStorage.setItem("Colorful_Notes", Is_Sticky_Colorful_Card.value);
    Is_Sticky_Colorful_Card.value
      ? (msg = "Colorful Notes Enabled - Your Next Notes Will Be Vibrant!")
      : (msg = "Standard Notes Active - New Notes Will Be Classic.");
    Show_Create_Edit_Model_Warning(msg, 5000);
  } catch (error) {
    console.log(error.message);
  }
}

const getCleanText = (text) =>
  !text
    ? ""
    : text
      // 1) Remove fenced code blocks
      .replace(/```([\s\S]*?)```/g, "$1")
      // 2) Remove inline code
      .replace(/`([^`]+)`/g, "$1")
      // 3) Remove headings (#)
      .replace(/^#{1,6}\s+/gm, "")
      // 4) Remove blockquotes (">")
      .replace(/^>\s?/gm, "")
      // 5) Remove horizontal rules
      .replace(/^(---|\*\*\*|___)$/gm, "")
      // 6) Remove combined bold+italic, bold, italic, strikethrough
      .replace(/(\*\*\*|___)(.*?)\1/g, "$2")
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/~~(.*?)~~/g, "$1")
      // 7) Remove Markdown links/images
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
      // 8) Remove custom [color] / [bg] tags
      .replace(/\[\/?(color|bg)(=[^\]]+)?\]/gi, "")
      // 9) Remove list markers at start of line
      .replace(/^\s*([-*+]|(\d+\.) )\s+/gm, "")
      // 10) Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // 11) Remove table separator lines (e.g. "|:---|---:|")
      .replace(/^\s*:?-+:?\s*(\|\s*:?-+:?\s*)+$/gm, "")
      // 12) Remove table data/header lines (start with "|")
      .replace(/^\|.*?\|.*$/gm, "")
      // 13) clean # to n numbers
      .replace(/^#+\s*/gm, "")
      // 14) clan &xxx (next line)
      .replace(/&nbsp;/g, "")
      .replace(/&lt;/g, "")
      .replace(/h3&gt;/g, "")
      // 15) Trim & normalize spaces
      .trim()
      .replace(/\s\s+/g, " ");

const getShortText = (html, Is_Title) => {
  if (!html || html == null || html == undefined || html == "") return ""; // Handle null/undefined cases

  let wrapper;
  html = String(html);
  // Remove bold/italic/strikethrough, color, heading, bullet markers
  if (!Is_Title) {
    wrapper = document.createElement("div");
    wrapper.innerHTML = html;
  }
  let source_text = Is_Title ? html ?? "" : wrapper.innerText ?? "";

  let clone_text = source_text?.trim();
  html = getCleanText(clone_text);
  const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  const threshold = window.outerWidth <= 500 ? (isFirefox ? 95 : 110) : isFirefox ? 130 : 140;
  if (html.length > threshold) {
    return html.substring(0, threshold) + "...";
  } else {
    return html; // Return the full text if it doesn't exceed the threshold
  }
};


// --- Media Cleanup Helpers ---

// Revokes the object URL and resets the element's source.
function resetMediaElement(el) {
  try {
    if (el.tagName === "VIDEO" || el.tagName === "AUDIO") {
      if (!el.paused) {
        el.pause();
        el.currentTime = 0;
      }
      if (el.src) {
        URL.revokeObjectURL(el.src);
      }
      el.src = "";
      el.load();
    } else if (el.tagName === "IMG") {
      if (el.src) {
        URL.revokeObjectURL(el.src);
      }
      el.src = "";
    } else if (el.tagName === "A") {
      if (el.href) {
        URL.revokeObjectURL(el.href);
      }
      el.href = "";
    }
  } catch (error) {
    console.log("Error in resetMediaElement:", error.message);
  }
}

// Aggressive DOM media cleanup: scans for lingering media elements.
function nukeDOMMedia() {
  try {
    const selectors = ["video", "audio", "img", "a"];
    const zombieElements = document.querySelectorAll(selectors.join(","));
    zombieElements.forEach((el) => resetMediaElement(el));
    if (window.gc) window.gc(); // Force GC in Chrome if available.
  } catch (error) {
    console.log("Error in nukeDOMMedia:", error.message);
  }
}

// --- Additional Final Cleanups ---

function hyperClean() {
  try {
    if (window.gc) {
      // eslint-disable-next-line no-undef
      gc();
      // eslint-disable-next-line no-undef
      gc();
    }
  } catch (error) {
    console.log("Error in hyperClean:", error.message);
  }
}

// --- UI Cleanup Helper ---

// Lowers opacity of media elements inside the provided container.
function fadeOutMediaElements() {
  try {
    const classes = ["video", "img", "audio", "document", "ai-rich-block"];
    classes.forEach((className) => {
      Note_View_UI_Text_Element.value.querySelectorAll(`.${className}`).forEach((el) => (el.style.opacity = 0));
    });
  } catch (error) {
    console.log("Error in fadeOutMediaElements:", error.message);
  }
}

function Stop_All_Playing_Media(Source) {
  // Find all video and audio elements inside the editor
  let Element_Source;
  if (Source === "Create_Edit_Mode") {
    Element_Source = Tiptap_Editor.view.dom.querySelectorAll("video, audio");
  } else if (Source === "View_Mode") {
    Element_Source = Note_View_UI_Text_Element.value.querySelectorAll("video, audio");
  }

  Element_Source.forEach((el) => {
    // Check if playing: not paused, not ended, and has currentTime > 0
    const isPlaying = !el.paused && !el.ended && el.currentTime > 0;
    if (isPlaying) {
      el.pause();
      /*       el.currentTime = 0; // optional: reset to start */
      console.log(`⏹ Stopped ${el.tagName.toLowerCase()} element`);
    }
  });

  if (Source === "View_Mode") {
    Element_Source = Note_View_UI_Text_Element.value.querySelectorAll("video, audio");
    // Stop loading online media in view mode
    Note_View_UI_Text_Element.value
      .querySelectorAll('[data-uid^="online_"]')
      ?.forEach((wrapper) => {
        wrapper?.querySelectorAll("video, audio")?.forEach((el) => {
          el.remove(); // our media is alredy on indexdb media or on indexdb html tables. here is just a a temp like.
        });
      });
  }
}

// --- Main Close & Cleanup Function ---

let pendingCloseTimeout = null;
let Reset_RO_View_Text_UI = ref(0)           // ← NEW (cancellable)

async function CloseBtn(original = "note_making") {
  try {

    if (original === "note_making") {
      // NOTE-MAKING MODE: Minimal UI changes and essential cleanup.
      if (EditMode.value) return;
      fullyCloseSTT();
      fully_close_prompt_STT();
      stopEverything();
      Stop_AI_Generation();
      Stop_OCR();
      if (isTouchFirst.value)
        await waitForKeyboardClose(200);
      toggle_delete_model.value = false;
      await new Promise(r => requestAnimationFrame(r));
      isAddBtnPressed.value = false;
      CurrentIndex.value = null;
      Close_Btn_Sound.play();
      console.log("Closing note-making form");
      stopRecording();
      Stop_All_Playing_Media("Create_Edit_Mode");
      hyperClean();
      //
    } else {
      // UI VIEW MODE: Immediate UI updates.

      if (!Opening_note_In_view_mode_completed.value) return;

      if (pendingCloseTimeout) {
        clearTimeout(pendingCloseTimeout);
        pendingCloseTimeout = null;
      }

      let View_UI_Has_Media = Note_View_UI_Text_Element.value.querySelectorAll("video, audio, img, .video, .audio, .img, .document, .ai-rich-block").length;
      console.log("Closing UI form");
      if (
        (SendImageForView && SendImageForView.length) ||
        (SendVideoForView && SendVideoForView.length) ||
        (SendAudioForView && SendAudioForView.length) ||
        (SendDocumentForView && SendDocumentForView.length) ||
        (View_UI_Has_Media)
      ) {
        console.log("UI form with media detected");
        Cancel_Operation.value = true;
        Stop_All_Playing_Media("View_Mode"); // online media stop loading handled inside this method.
        fadeOutMediaElements(); // visually fade out media immediately
        IsRoViewNoteOpen.value = false;
        pendingCloseTimeout = setTimeout(() => {
          SendNoteForView_Title.value = null;
          SendNoteForView_Message.value = null;
          pendingCloseTimeout = null;
          ++Reset_RO_View_Text_UI.value;
        }, 400);
        Close_Btn_Sound.play();
      } else {
        Stop_All_Playing_Media("View_Mode"); // online media stop loading handled inside this method.
        console.log("UI form without media");
        IsRoViewNoteOpen.value = false;
        pendingCloseTimeout = setTimeout(() => {
          SendNoteForView_Title.value = null;
          SendNoteForView_Message.value = null;
          pendingCloseTimeout = null;
          ++Reset_RO_View_Text_UI.value;
        }, 400);
        Close_Btn_Sound.play();
      }

      // Fire off all other cleanup tasks in the background.
      (async () => {
        try {
          RO_View_Mode_Array_And_Links_Cleaner();
          purgeObjectURLs(null, "View_Mode");
          terminateAllWorkers("view");
          hyperClean();
          console.log("UI view background cleanup completed.");
        } catch (bgError) {
          console.log("Error during UI view background cleanup:", bgError.message);
        }
      })();
    }
    Cancel_Operation.value = false;
    if (document.body.classList.contains("disable_body_scroll_on_note_full_screen"))
      document.body.classList.remove("disable_body_scroll_on_note_full_screen");
    Blur_Background_WhileOpening_Note.value = false;
    console.log("closing blur");
    All_Storage_DS_Logs();
  } catch (error) {
    console.log("Error in CloseBtn:", error.stack);
    alert("Something went wrong While Closing... Please Reload The Page");
  }
  finally {
    Opening_note_In_view_mode_progressing.value = false;
    Opening_note_In_view_mode_completed.value = false;
  }
}

function Toggle_Note_Full_Screen() {
  try {
    Toggle_Reading_Form_Full_Screen.value = !Toggle_Reading_Form_Full_Screen.value;
    document.body.classList.toggle("disable_body_scroll_on_note_full_screen");
  } catch (error) {
    console.log(error.stack);
    debugError(error, "Method");
  }
}

// Call this function whenever you open a note to force a re-render.
function updateRefreshKey() {
  try {
    refreshKey.value = getSafeUUID();
  } catch (error) {
    console.log(error.stack);
    debugError(error, "Method");
  }
}

const boxStyle = computed(() => ({
  backgroundColor: bg[colorIndex.value],
  color: clr[colorIndex.value] + "!important",
}));

const changeColor = () => {
  colorIndex.value = (colorIndex.value + 1) % bg.length;
  console.log(colorIndex, " --> ", clr[colorIndex.value]);
};

const buttonStyle = computed(() => ({
  borderColor: getBorderColor(),
}));

const getBorderColor = () => {
  const borderColor = new Array(4).fill("transparent");
  for (let i = 0; i <= colorIndex.value; i++) {
    borderColor[i] = "yellow";
  }
  return borderColor.join(" ");
};

function align_Note_View_UI_Text() {
  try {
    Alignment_index.value =
      (Alignment_index.value + 1) % align_properties_arr.value.length;
    change_text_alignment();
    localStorage.setItem("align_text", Alignment_index.value);
  } catch (error) {
    console.log(error.message);
  }
}

function change_text_alignment() {
  try {
    Note_View_UI_Text_Element.value.style.textAlign =
      align_properties_arr.value[Alignment_index.value];
  } catch (error) {
    console.log(error.message);
  }
}

function Turn_Off_Loading_Screen() {
  try {
    if (Loading.value && Remove_Loading_Screen.value) {
      setTimeout(() => {
        Loading.value = false;
      }, 1000);
      /////
      setTimeout(
        () => (Loading_screen_end_then_animate_notes_card_con.value = true),
        1200
      );
      setTimeout(() => (Remove_Loading_Screen.value = false), 1400);
    }
  } catch (error) {
    console.log(error.message);
  }
}

function Hide_All_Notes_Loaded_Container() {
  try {
    All_Notes_Loaded_Message_Container_Element.value = false;
    setTimeout(() => {
      All_Notes_loaded_Element.value.parentElement.style.height = 0;
      All_Notes_loaded_Element.value.parentElement.parentElement.style.rowGap = "0";
    }, 300);
  } catch (error) {
    console.log(error.message);
  }
}

function All_Notes_Loaded(message) {
  try {
    All_Notes_Loaded_Message_Container_Element.value = false;
    setTimeout(() => {
      More_Notes_Are_Coming.value = false;
      All_Notes_loaded_Element.value.parentElement.style.height = "unset"; // before message show we need to make its div height to normal again.
      All_Notes_loaded_Element.value.parentElement.parentElement.style.rowGap = ".5rem";
      All_Notes_loaded_Element.value.textContent = message;
      All_Notes_Loaded_Message_Container_Element.value = true;
    }, 1000);
    window.removeEventListener("scroll", debouncedScroll);
    return;
  } catch (error) {
    console.log(error.message);
  }
}

function Show_Critical_Error(message) {
  try {
    Toggle_Critical_Error.value = true;
    setTimeout(() => {
      Critical_Error_Message.value.textContent = message;
    }, 100);
  } catch (error) {
    console.log(error.message);
  }
}

function storage_capacity_checker() {
  try {
    if (!navigator.storage || !navigator.storage.estimate) {
      console.log("Storage API not supported in this browser.");
      Show_Critical_Error("Storage API not supported in this browser.");
      return;
    }

    navigator.storage.estimate().then((estimate) => {
      if (!estimate.usage || !estimate.quota) {
        console.log("Unable to retrieve storage estimate.");

        // Retrieve error count from localStorage (default to 0 if not present)
        let errorCount = parseInt(
          localStorage.getItem("Storage_Estimate_Error_Count") || "0",
          10
        );

        if (errorCount < 3) {
          // Increment the error counter and reload the page
          errorCount++;
          localStorage.setItem("Storage_Estimate_Error_Count", errorCount);
          window.location.reload();
        } else {
          // On the fourth failure or more, show critical error message
          Show_Critical_Error(
            "Unable to retrieve storage estimate, Please Reload The Page!"
          );
        }
        return;
      }

      // Reset error count on success
      localStorage.removeItem("Storage_Estimate_Error_Count");

      const usedGB = (estimate.usage / 1024 ** 3).toFixed(1);
      const totalGB = (estimate.quota / 1024 ** 3).toFixed(1);
      const percentage = ((estimate.usage / estimate.quota) * 100).toFixed(2);

      Used_Storage_Capacity.value = usedGB;
      Total_Storage_Capacity.value = totalGB;
      Used_Storage_Capacity_Percentage.value = percentage;

      if (Used_Storage_Capacity_Element.value) {
        Used_Storage_Capacity_Element.value.style.width = percentage + "%";
      }

      console.log(`Used: ${usedGB} GB`);
      console.log(`Total: ${totalGB} GB`);
      console.log(`Used Capacity: ${percentage}%`);
    });
  } catch (error) {
    console.log(error.message);
  }
}


const radius = 22
const circumference = 2 * Math.PI * radius

const dashOffset = computed(() => {
  return circumference - (Used_Storage_Capacity_Percentage.value / 100) * circumference
})


function ShowErrors(error) {
  try {
    if (error.name === "QuotaExceededError") {
      // Inform the user that storage is full.
      Show_Critical_Error(
        "Storage quota exceeded. Please free up some space or try again later."
      );
    } else if (error.name === "ConstraintError") {
      // Handle duplicate key error.
      Show_Critical_Error("A note with this identifier already exists.");
    } else if (error.name === "AbortError") {
      // Handle a transaction abort.
      Show_Critical_Error("Operation aborted. Please try again.");
    } else {
      // General error handling.
      Show_Critical_Error("Something Went Wrong! Reload The Page.");
    }
    controller.abort();
  } catch (error) {
    console.log(error.message);
  }
}

function Scroll_Reached_Bottom() {
  try {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight; // More reliable

    if (windowHeight + scrollTop >= docHeight - 10) {
      // Add small buffer
      fetchAllNotes();
    }
  } catch (error) {
    console.log(error.message);
  }
}


let debounceTimeout;
function debouncedScroll() {
  try {
    if (debounceTimeout)
      clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(Scroll_Reached_Bottom, 150);
  } catch (error) {
    console.log(error.message);
  }
}

const workerRegistries = {
  save: new Map(),
  view: new Map(),
};

function terminateAllWorkers(type = null, ...ids) {
  try {
    // Convert provided IDs into a Set for fast lookup
    const idSet = new Set(ids);
    const registryTypes = type ? [type] : Object.keys(workerRegistries);

    console.log(`[WorkerManager] Termination request received.`);
    console.log(`- Type: ${type || "ALL"}`);
    console.log(`- Target IDs: ${ids.length > 0 ? [...idSet].join(", ") : "ALL"}`);

    registryTypes.forEach((registryType) => {
      const registry = workerRegistries[registryType];

      if (!registry) {
        console.warn(`[WorkerManager] Invalid worker type: ${registryType}. Skipping.`);
        return;
      }

      if (idSet.size > 0) {
        // Terminate only specified workers
        for (const id of idSet) {
          if (!id) continue;

          if (registry.has(id)) {
            const res = terminateWorker(id, registryType);
            if (res) idSet.delete(id);
          } else {
            console.warn(`[WorkerManager] Worker ID ${id} not found in ${registryType}.`);
          }
        }
      } else {
        // Terminate all workers in this category
        console.log(
          `[WorkerManager] Terminating all workers in category: ${registryType}`
        );
        for (const [id] of registry) {
          terminateWorker(id, registryType);
        }
      }
    });

    console.log("[WorkerManager] Worker termination process completed.");
  } catch (error) {
    console.error("[WorkerManager] Error terminating workers:", error.message);
  }
}

function terminateWorker(id, registryType) {
  let worker;
  try {
    const registry = workerRegistries[registryType];
    if (!registry || !registry.has(id)) {
      console.warn(`[WorkerManager] Worker ID ${id} not found in ${registryType}.`);
      return false;
    }

    worker = registry.get(id);
    if (!worker) {
      console.error(`[WorkerManager] Error Worker not found ${id}:`);
      return false;
    }

    console.log(`[WorkerManager] Terminating Worker ${id} of type ${registryType}...`);

    worker.postMessage({ command: "SUICIDE" });

    worker.onmessage = (event) => {
      if (event.data.status === "SUICIDE_CONFIRMED") {
        console.log("[Main] Worker confirmed suicide");
        worker.terminate();
      }
      if (event.data.error) worker.terminate();
    };
    registry.delete(id);

    console.log(`[WorkerManager] ✅ Worker ${id} successfully terminated.`);
    return true;
  } catch (error) {
    console.error(`[WorkerManager] Error terminating Worker ${id}:`, error.message);
    worker.terminate();
    return false;
  }
}



// This function now returns a promise that resolves when the worker has processed the note.
function Decompresion_Worker(compressedNote, Is_Note) {
  return new Promise((resolve, reject) => {
    let newWorker;
    try {
      resetController();
      newWorker = new Worker(
        new URL("./components/decompression_worker.js", import.meta.url),
        {
          type: "module",
        }
      );
      const workerId = getSafeUUID();
      workerRegistries.view.set(workerId, newWorker);
      console.log("Worker created with ID:", workerId);

      console.log("Main sending compressed note to worker:", compressedNote);
      newWorker.postMessage({ Id: workerId, IsNote: Is_Note, Data: compressedNote }, [
        compressedNote.buffer,
      ]);
      compressedNote = null;

      newWorker.onmessage = function (e) {
        if (e.data.error) {
          console.log("Worker sent error:", e.data.error);
          // Reject the promise if the worker encountered an error.
          newWorker.terminate();
          terminateAllWorkers("view");
          reject(e.data.error);
          Show_Critical_Error("Notes Decompression Failed! Reload Page or Browser.");
          More_Notes_Are_Coming.value = false;
          Loading.value = false;
          controller.abort();
        } else if (e.data.note) {
          console.log("Worker processed data:", e.data.note);
          e.data.note.IsLoading = false;
          //
          Is_Note ? data.value.push(e.data.note) : null;
          // newWorker.terminate();
          resolve({ Id: e.data.Id, Data: e.data.note });
          e.data.note = null;
        }
      };
    } catch (error) {
      newWorker.terminate();
      terminateAllWorkers("view");
      compressedNote = null;
      reject(error);
      Show_Critical_Error("Notes Decompression Failed! Reload Page or Browser.");
      controller.abort();
    }
  });
}


async function SeedNote_On_first_time_app_load() {
  try {
    let cls_note_demo_note;
    let clr_note_demo_note;
    // Safe boolean check (no JSON.parse)
    const demoSeeded = localStorage.getItem("demoNoteSeeded") === "true";

    const count = await db.notes.count();

    if (count === 0) {
      cls_note_demo_note = await db.notes.get(10102);
      clr_note_demo_note = await db.notes.get(10103);
    }

    // Only seed if truly first time (no notes + never seeded before)
    if ((!cls_note_demo_note && !clr_note_demo_note) && count === 0 && !demoSeeded) {
      let currentDate = new Date();
      let formattedDate = currentDate.toLocaleDateString();


      // WorkSpace

      let WS = {
        id: 'ws_1776684663761',
        name: "Our First Note",
        color: "#F9A03F",
        subgroups: [{ "name": "Note SubGroup", "soft_deletion": false, "hard_deletion": false }]
      }

      const Classic_Show_Case_Note = {
        title: "Classic Note",
        userWroteHtml: highlightHTMLBlock(Note),
        userWroteJson: json,
        NotesDate: formattedDate,
        isCardGoingDeleted: false,
        IsLoading: false,
        id: 10102,
        Card_Title_Color: "rgb(68 68 68)",
        Card_Para_Color: "rgb(46 46 46)",
        Card_Footer_Color: "rgb(68 68 68)",
        Attachment_Used_Size: Max_Accumulated_Attachments_Size.value,
        TimeStamp: new Date().toISOString(),
        // Make sure createdAt exists for ordering (Dexie uses this)
        createdAt: new Date().toISOString(),
        isFav: true,
        WorkSpaceId: "ws_1776684663761",
        SubGroupId: null,
      };

      const Colorful_Show_Case_Note = {
        title: "Colorful Note",
        userWroteHtml: highlightHTMLBlock(Note),
        userWroteJson: json,
        NotesDate: formattedDate,
        isCardGoingDeleted: false,
        IsLoading: false,
        id: 10103,
        Card_Title_Color: "rgba(71, 91, 225, 0.85)",
        Card_Para_Color: "rgba(71, 91, 225, 0.85)",
        Card_Footer_Color: "rgba(71, 91, 225, 0.85)",
        Attachment_Used_Size: Max_Accumulated_Attachments_Size.value,
        TimeStamp: new Date().toISOString(),
        // Make sure createdAt exists for ordering (Dexie uses this)
        createdAt: new Date().toISOString(),
        isFav: false,
        WorkSpaceId: "ws_1776684663761",
        SubGroupId: 'Note SubGroup',
      };

      toggleFavorite(Classic_Show_Case_Note);

      workspaces.value.push(WS);
      await db.workSpaces.put(toRaw(WS));

      // 1. Save to IndexedDB FIRST
      let cls_res = await Compresion_Worker(Classic_Show_Case_Note, "note", "save");
      let clr_res = await Compresion_Worker(Colorful_Show_Case_Note, "note", "save");
      terminateAllWorkers("save");

      if (clr_res.Status == "success" && cls_res.Status == "success") {

        // 2. Only mark as seeded if save succeeded
        localStorage.setItem("demoNoteSeeded", "true");
        console.log("✅ Demo note seeded successfully");
        setTimeout(() => {
          All_Notes_Loaded('✨ Welcome To Sticky Colorful Doc Notes App!! ✨');
        }, 1000);

        setTimeout(() => openSidebar(), 1500);
        setTimeout(() => closeSidebar(), 3000);

      }
    }
  } catch (error) {
    console.error("SeedNote failed:", error);
    // Do NOT set the flag if anything failed → will retry next load
  }
}


function reset_searchbar() {
  try {
    inputData.value = "";
    SearchBtnLogic();
  } catch (error) {
    console.log(error.message);
  }
}

function sorting() {
  try {
    reset_searchbar();
    sort_order.value = sort_order.value === "asc" ? "desc" : "asc";
    localStorage.setItem("sort_order", sort_order.value);


    PersistSort();
  } catch (error) {
    console.log(error.message);
  }
}


function PersistSort() {
  try {
    if (sort_order.value === "asc") {
      data.value.sort((a, b) => (a.ManualOrder ?? 0) - (b.ManualOrder ?? 0));
    } else {
      data.value.sort((a, b) => (b.ManualOrder ?? 0) - (a.ManualOrder ?? 0));
    }
    // Keep manual order if user has reordered
  } catch (error) {
    console.log(error.message);
  }
}


function onDraggableChange() {
  try {
    // Save the new manual order when user drags
    data.value.forEach((note, idx) => {
      console.log(note.id);
      note.ManualOrder = idx;
    });
    // Optional: persist to localStorage
    localStorage.setItem("noteManualOrder", JSON.stringify(
      data.value.map(n => ({ id: n.id, order: n.ManualOrder }))
    ));
  } catch (error) {
    console.log(error.message);
  }
}


let isFetchingNotes = ref(false);
async function fetchAllNotes() {
  let compressed_notes = null;
  let workerPromises = null;
  let results = null;
  let allWorkerIds = null;
  let query = null;
  try {
    if (isFetchingNotes.value) {
      console.log("Notes fetching is already in progress. Please wait.");
      return; // Exit if a fetch operation is already in progress
    }

    isFetchingNotes.value = true; // Set the flag to true
    console.log("Notes fetching in progress...");

    // Reset any existing controller state.
    resetController();

    //reset_searchbar();

    // Build an array of excluded IDs if we are not on the very first batch.
    let excludedIds = [];
    if (
      Newly_Created_Notes_Id_For_Backend_To_Avoid_Send_Them_During_pagination.value
        .length > 0
    ) {
      excludedIds =
        Newly_Created_Notes_Id_For_Backend_To_Avoid_Send_Them_During_pagination.value;
    }

    // Determine the offset and limit for the query.
    // Here, we assume that:
    const startIndex =
      (Fetch_Notes_In_Parts.value.Start_From_Note - 1) *
      Fetch_Notes_In_Parts.value.Fetch_Till_Note;
    const limitCount = Fetch_Notes_In_Parts.value.Fetch_Till_Note;

    console.log("start index:", startIndex, "limit:", limitCount);
    console.log("excluded ids:", excludedIds);

    query = await db.notes.orderBy("createdAt").reverse();

    if (excludedIds.length > 0) {
      query = query.filter((note) => !excludedIds.includes(note.id));
    }

    compressed_notes = await query.offset(startIndex).limit(limitCount).toArray();

    if (Fetch_Notes_In_Parts.value.Start_From_Note !== 1) {
      More_Notes_Are_Coming.value = true;
    }
    console.log("More notes Loading Icon:", More_Notes_Are_Coming.value);

    // If no notes are returned, then all notes are loaded.
    if (compressed_notes.length === 0) {
      if (Fetch_Notes_In_Parts.value.Start_From_Note !== 1) {
        All_Notes_Loaded('✨ All Notes Are Loaded! ✨');
      }
      Turn_Off_Loading_Screen();
      isFetchingNotes.value = false;
      return;
    }

    Fetch_Notes_In_Parts.value.Start_From_Note++;

    workerPromises = compressed_notes.map((compressed_note, idx) => {
      const newNote = data.value.find(n => n.id === compressed_note.note.id);
      if (newNote && newNote.ManualOrder === undefined) {
        newNote.ManualOrder = data.value.length + idx; // Append to end
      }
      console.log("Sending note to worker:", compressed_note.note);
      return Decompresion_Worker(newNote ? newNote : compressed_note.note, true);
    });

    // Wait until all workers have finished processing and pushed their results to the UI.
    results = await Promise.all(workerPromises);
    allWorkerIds = results.map((result) => {
      result.Data = null;
      return result.Id;
    });
    console.log("[Decompression] All workers completed. IDs:", allWorkerIds);
    terminateAllWorkers("view", ...allWorkerIds);


    const favs = await db.favorites.toArray();
    const favIds = favs.map(f => f.id);

    console.log("Favorites fetched:", favIds);

    data.value.forEach(note => {
      note.isFav = favIds.includes(note.id);
      note.ManualOrder = OrderMap.value?.get(note?.id) ?? data.value?.indexOf(note);
    });



    PersistSort();

    More_Notes_Are_Coming.value = false;

    if (Fetch_Notes_In_Parts.value.Start_From_Note == 2) {
      Turn_Off_Loading_Screen();
    }
    console.log("Notes fetched successfully.");
  } catch (error) {
    console.error(error.message);
    ShowErrors(error);
    terminateAllWorkers("view");
    More_Notes_Are_Coming.value = false;
    Loading.value = false;
  } finally {
    isFetchingNotes.value = false; // Reset the flag in the `finally` block
    query = null;
    compressed_notes = null;
    workerPromises = null;
    results = null;
    allWorkerIds = null;
  }
}

async function DeleteNote(Delete_id) {
  try {
    resetController();
    await db.transaction("rw", db.notes, db.media, db.favorites, async () => {
      await db.notes.delete(Delete_id);
      await db.media.delete(Delete_id);

      const fav = await db.favorites.get(Delete_id);
      if (fav) await db.favorites.delete(Delete_id);

      Delete_Note_Sound.play();
    });
    console.log("Notes Deleted Successfully Of Id: " + Delete_id);
    storage_capacity_checker();
  } catch (error) {
    console.log(error.message);
    ShowErrors(error);
  }
}

// reset the final temp object array which move all files of (Edit / Create) Mode array inside it to save in db.
function Reset_Media_Object() {
  try {
    media_object.value.id = null;
    const revokeAndClear = (array) => {
      console.log("reseting media holding arrays done ", array);
      array.splice(0, array.length); // Clear the array
      array.length = 0; // Reset the length to 0
      array = []; // Reassign to an empty array
    };
    // Revoke URLs and clear each media array
    revokeAndClear(media_object.value.ImageFile);
    revokeAndClear(media_object.value.VideoFiles);
    revokeAndClear(media_object.value.AudioFiles);
    revokeAndClear(media_object.value.DocumentFiles);
    console.log("Media object reset and URLs revoked.", media_object.value);
  } catch (error) {
    console.log(error.message);
  }
}

/* async function Post_Note(note, media) {
  // Compress the note using the Web Worker
  let newNote = null;
  let compressedNote = null;
  let new_Note_Media = null;
  let compressedMedia = null;

  try {
    resetController();
    console.log("[Frontend] Preparing to compress the note...");

    // Ensure the note is valid before proceeding
    console.log(note);

    if (!note) {
      console.error("[Frontend] Invalid note data.");
      return;
    }

    // Destructure the response from the compression worker.
    compressedNote = await Compresion_Worker(note, "note");
    console.log("[Frontend] Note compressed successfully.", compressedNote);

    newNote = {
      id: note.id,
      note: compressedNote.Data,
      createdAt: new Date(),
      updatedAt: null,
    };

    if (
      media &&
      (media.ImageFile.length > 0 ||
        media.VideoFiles.length > 0 ||
        media.AudioFiles.length > 0 ||
        media.DocumentFiles.length > 0)
    ) {
      compressedMedia = await Compresion_Worker(media, "media");
      console.log("[Frontend] Note compressed successfully.", compressedMedia);

      new_Note_Media = {
        id: note.id,
        blob: compressedMedia.Data,
        createdAt: new Date(),
        updatedAt: null,
      };
    }

    await db.transaction("rw", db.notes, db.media, async () => {
      await db.notes.add(newNote);
      if (new_Note_Media) await db.media.add(new_Note_Media);
      data.value[data.value.findIndex((n) => n.id == note.id)].IsLoading = false;
    });

    Newly_Created_Notes_Id_For_Backend_To_Avoid_Send_Them_During_pagination.value.push(
      note.id
    );
    console.log("All workers terminated and object URLs purged.");
    storage_capacity_checker();
  } catch (error) {
    stop_all_media();
    terminateAllWorkers("save");
    console.error("[Frontend] Error in Post_And_Notes:", error.message);
    // Optionally, display an error message to the user
    ShowErrors(error);
  } finally {
    console.log("cleaning in process...");
    Reset_Media_Object();
    terminateAllWorkers("save", compressedMedia.Id, compressedNote.Id);
    newNote = null;
    compressedNote = null;
    new_Note_Media = null;
    compressedMedia = null;
    note = null;
    media = null;
    purgeObjectURLs();
    console.log("All workers terminated and object URLs purged. Post method!");
  }
}

async function Update_Note(note, media) {
  let compressedNote = null;
  let updatedNote = null;
  let compressedMedia = null;
  let updatedMedia = null;
  let Is_Media_Exist_for_Note = null;

  try {
    resetController();
    console.log("[Frontend] Preparing to compress the note...");

    // Ensure the note is valid before proceeding
    console.log(note);

    if (!note) {
      console.error("[Frontend] Invalid note data.");
      return;
    }
    Is_Media_Exist_for_Note = await db.media.get(note.id);

    // Compress the note using the Web Worker
    compressedNote = await Compresion_Worker(note, "note");
    console.log("[Frontend] Note compressed successfully.", compressedNote.Data);

    updatedNote = {
      note: compressedNote.Data,
      updatedAt: new Date(),
    };

    compressedMedia = await Compresion_Worker(media, "media");
    console.log("[Frontend] Note compressed successfully.", compressedMedia.Data);
    updatedMedia = {
      blob: compressedMedia.Data,
      updatedAt: new Date(),
    };

    await db.transaction("rw", db.notes, db.media, async () => {
      await db.notes.update(note.id, updatedNote);
      if (Is_Media_Exist_for_Note) {
        if (updatedMedia) {
          await db.media.update(note.id, updatedMedia);
          console.log("updating the media");
        }
      } else {
        // Create new media entry if none exists
        await db.media.add({
          id: note.id,
          blob: compressedMedia.Data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      note.IsLoading = false;
    });
  } catch (error) {
    stop_all_media();
    terminateAllWorkers("save");
    console.error("[Frontend] Error in Update_Notes:", error.message);
    // Optionally, display an error message to the user
    ShowErrors(error);
  } finally {
    console.log("cleaning in process...");
    Reset_Media_Object();
    terminateAllWorkers("save", compressedNote.Id, compressedMedia.Id);
    compressedNote = null;
    updatedNote = null;
    compressedMedia = null;
    updatedMedia = null;
    Is_Media_Exist_for_Note = null;
    note = null;
    media = null;
    purgeObjectURLs();
    console.log("All workers terminated and object URLs purged. update method!");
    storage_capacity_checker();
  }
} */

function getSafeUUID() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return (
      "uuid-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2)
    );
  } catch (error) {
    console.log(error.message);
  }
}

function Compresion_Worker(data, type, operation) {
  let worker;
  let mediaClone = null;
  let transferList = null;
  resetController();
  console.log("Sending note to worker ", data);

  try {
    worker = new Worker(new URL("./components/compression_worker.js", import.meta.url), {
      type: "module",
    });
    const workerId = getSafeUUID();
    console.log("Worker ID:", workerId);
    workerRegistries.save.set(workerId, worker);
    console.log("Worker created with ID:", workerId);

    // Send the note data to the worker for compression
    if (type == "note") {
      worker.postMessage({
        Id: workerId,
        Type: type,
        Data: JSON.stringify(data),
        Operation: operation,
      });
    } else if (type === "media") {
      mediaClone = deepCloneWithoutProxy(data);

      transferList = Object.values(mediaClone)
        .flat()
        .map((item) => item.Data)
        .filter((data) => data instanceof ArrayBuffer);

      worker.postMessage(
        {
          Id: workerId,
          Type: type,
          Media_Buffer: mediaClone,
          Operation: operation,
        },
        transferList
      );
      Reset_Media_Object(); // Reset media object after sending
      data = null; // Clear data reference after sending
    } else {
      console.log("No type found from data in compression method main");
    }

    return new Promise((resolve, reject) => {
      worker.onmessage = (event) => {
        if (event.data.error) {
          console.error("[Frontend] Worker Compression Error:", event.data.error);
          worker.terminate(); // Clean up worker after task completion
          reject(event.data.error);
          Show_Critical_Error("Notes Compression Failed! Reload Page or Browser.");
          controller.abort();
        } else {
          console.log("Worker_finished Product ", event.data);
          /*           worker.terminate(); // Clean up worker after task completion */
          resolve({
            Operation: event.data.Operation,
            Type: event.data.Type,
            Status: event.data.status,
            Id: event.data.Id,
            id: event.data.id,
          }); // Compression successful
          if (event.data.status == "success") {
            console.log("Compression successful");
          } else {
            console.log("Compression failed");
          }
        }
        data = null;
        event.data.Data = null;
      };

      worker.onerror = (error) => {
        console.error("[Frontend] Error in Web Worker:", error.message);
        reject(new Error(error.message)); // Handle generic worker errors
        Show_Critical_Error("Notes Compression Failed! Reload Page or Browser.");
        worker.terminate();
        controller.abort();
        Reset_Media_Object();
        terminateAllWorkers("save");
        purgeObjectURLs(null, EditMode.value ? "Edit_Mode" : "Create_Mode");
        storage_capacity_checker();
        data = null;
      };
      data = null;
    });
  } catch (error) {
    console.log(error.message);
    Show_Critical_Error("Notes Compression Failed! Reload Page or Browser.");
    worker.terminate();
    controller.abort();
    Reset_Media_Object();
    terminateAllWorkers("save");
    purgeObjectURLs(null, EditMode.value ? "Edit_Mode" : "Create_Mode");
    storage_capacity_checker();
    console.error("Error in Post_Update_Notes_Compression:", error.message);
    // Optionally, display an error message to the user
    ShowErrors(error);
  } finally {
    data = null;
    mediaClone = null;
    transferList = null;
  }
}

function deepCloneWithoutProxy(obj) {
  try {
    if (obj instanceof ArrayBuffer) return obj; // Preserve ArrayBuffer
    if (Array.isArray(obj)) return obj.map(deepCloneWithoutProxy);
    if (obj !== null && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, deepCloneWithoutProxy(value)])
      );
    }
    return obj;
  } catch (error) {
    console.log(error.message);
  }
}

/* --------------------------- */
// Toggles camera options visibility
let originalStream = null;
let canvasStream = null;
let offscreenVideo = null;
let canvas = null;
let ctx = null;
// Helper: Get a supported MIME type for the given recording type.
function getSupportedMimeType(type) {
  try {
    let mimeTypes = [];

    if (type === "audio") {
      mimeTypes = [
        "audio/webm; codecs=opus", // Best for modern audio
        "audio/webm; codecs=pcm", // Raw PCM (high quality)
        "audio/mp4; codecs=aac", // AAC for MP4 support
        "audio/mpeg", // MP3 format (broader support)
        "audio/ogg; codecs=opus", // Opus in OGG
        "audio/ogg; codecs=vorbis", // Vorbis in OGG
        "audio/webm", // Generic WebM
        "audio/wav", // WAV (fallback)
      ];
    } else if (type === "video") {
      mimeTypes = [
        "video/webm; codecs=vp9,opus", // Best modern choice (VP9 + Opus)
        "video/webm; codecs=vp8,opus", // VP8 + Opus
        "video/mp4; codecs=avc1.640029,mp4a.40.2", // H.264 + AAC (MP4)
        "video/mp4; codecs=avc1.42E01E,mp4a.40.2", // H.264 Baseline + AAC
        "video/ogg; codecs=theora,vorbis", // Theora + Vorbis (OGG)
        "video/webm", // Generic WebM (fallback)
      ];
    }

    for (let mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        console.log("Supported MIME type found:", mime);
        return mime;
      }
    }
    console.warn("No supported MIME type found for", type);
    Show_Create_Edit_Model_Warning("No supported MIME type found for " + type, 2000);
    return "";
  } catch (error) {
    console.log(error.message);
  }
}

function VideoRec() {
  try {
    // FIX: Kill the keyboard immediately by blurring the active element
    if (document.activeElement) {
      document.activeElement.blur();
    }
    if (!Is_Video_Recording.value) {
      Front_Back_Camera.value = !Front_Back_Camera.value;
    } else {
      stopRecording();
    }
  } catch (error) {
    console.log(error.message);
  }
}

// Camera option buttons
function FrontCamVideoRec() {
  try {
    // FIX: Kill the keyboard immediately by blurring the active element
    if (document.activeElement) {
      document.activeElement.blur();
    }
    if (Is_AI_Edit_Started.value || OCR_Processing.value || isRecording.value) {
      Show_Create_Edit_Model_Warning("Please Wait Until AI Process Is Finished.", 3000);
      return;
    }
    startVideoRecording("user");
    Front_Back_Camera.value = !Front_Back_Camera.value;
    /* Close_Video_Audio_Preview(); */
  } catch (error) {
    console.log(error.message);
  }
}

function BackCamVideoRec() {
  try {
    // FIX: Kill the keyboard immediately by blurring the active element
    if (document.activeElement) {
      document.activeElement.blur();
    }

    if (Is_AI_Edit_Started.value || OCR_Processing.value || isRecording.value) {
      Show_Create_Edit_Model_Warning("Please Wait Until AI Process Is Finished.", 3000);
      return;
    }

    startVideoRecording("environment");
    Front_Back_Camera.value = !Front_Back_Camera.value;
    /* Close_Video_Audio_Preview(); */
  } catch (error) {
    console.log(error.message);
  }
}

// Audio recording button
function AudioRec() {
  try {
    // FIX: Kill the keyboard immediately by blurring the active element
    if (document.activeElement) {
      document.activeElement.blur();
    }

    if (Is_AI_Edit_Started.value || OCR_Processing.value || isRecording.value) {
      Show_Create_Edit_Model_Warning("Please Wait Until AI Process Is Finished.", 3000);
      return;
    }

    if (!Is_Audio_Recording.value) {
      Front_Back_Camera.value = false;
      startAudioRecording();
    } else {
      stopRecording();
    }
  } catch (error) {
    console.log(error.message);
  }
}

// Start video recording
async function startVideoRecording(facingMode) {
  try {
    /* Close_Video_Audio_Preview(); */
    let Camera_Devices = ref([]);

    if (currentStream) {
      stopStream(currentStream);
      currentStream = null;
    }
    const constraints = {
      video: { facingMode },
      audio: true,
    };

    // Get the original stream
    try {
      originalStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch {
      Show_Create_Edit_Model_Warning("Camera Access Denied, Please Allow it and Try Again.", 3000);
      return;
    }
    currentStream = originalStream; // keep a reference
    const All_Devices = await navigator.mediaDevices.enumerateDevices();

    if (All_Devices.length === 0) {
      Show_Create_Edit_Model_Warning("No Camera Found!", 2000);
      stopRecording();
      return;
    }

    Camera_Devices.value = All_Devices.filter((device) => device.kind === "videoinput");

    if (Camera_Devices.value.length === 0) {
      Show_Create_Edit_Model_Warning("No Camera Found!", 2000);
      stopRecording();
      return;
    }

    let Currently_Using_Camera_Device_ID = originalStream
      .getVideoTracks()[0]
      .getSettings().deviceId;

    let frontCameraDetected = false;
    let backCameraDetected = false;

    Camera_Devices.value.forEach((device) => {
      const label = device.label.toLowerCase();
      if (label.includes("back") || label.includes("rear")) {
        console.log("Back Camera Detected:", device.deviceId);
        backCameraDetected = true;
        if (device.deviceId === Currently_Using_Camera_Device_ID) {
          Is_Front_Camera_In_Use.value = false;
        }
      } else if (label.includes("front") || label.includes("integrated")) {
        console.log("Front Camera Detected:", device.deviceId);
        frontCameraDetected = true;
        if (device.deviceId === Currently_Using_Camera_Device_ID) {
          Is_Front_Camera_In_Use.value = true;
        }
      }
    });

    // Fallback if labels are not clear
    if (!frontCameraDetected && !backCameraDetected) {
      Camera_Devices.value.forEach((device) => {
        if (device.deviceId === Currently_Using_Camera_Device_ID) {
          Is_Front_Camera_In_Use.value = facingMode === "user";
        }
      });
    }

    Current_Video_Stream_Track.value = originalStream.getVideoTracks()[0];
    if (!Current_Video_Stream_Track.value) {
      console.log("No Video track found");
      return;
    }

    // Check torch support via getCapabilities().
    const capabilities = Current_Video_Stream_Track.value.getCapabilities();
    if (!capabilities) {
      console.log("No capabilities found");
      // return;
    }

    if (!("torch" in capabilities)) {
      console.log("Torch is not supported");
      Is_FlashLight_Supported.value = false;
      //flash_light_btn_element.value.disabled = true;
      Is_FlashLight_On.value = false;
      Show_Create_Edit_Model_Warning(
        `Device ${Is_Front_Camera_In_Use.value ? "Front Camera" : "Back Camera"
        } Does Not Support Flash Light!`,
        2000
      );
    } else {
      console.log("Torch is supported");
      Is_FlashLight_Supported.value = true;
      //flash_light_btn_element.value.disabled = false;
    }

    Toggle_Torch();

    // Set mirroring flag
    Is_Video_Mirroring.value = !!Is_Front_Camera_In_Use.value;

    // If using front camera, mirror the stream
    if (Is_Video_Mirroring.value) {
      // Create an offscreen video element
      offscreenVideo = document.createElement("video");
      offscreenVideo.style.display = "none"; // hide it
      offscreenVideo.srcObject = originalStream;
      offscreenVideo.muted = true;

      // Wait for metadata to load to get video dimensions
      await new Promise((resolve, reject) => {
        offscreenVideo.onloadedmetadata = () => {
          resolve();
        };
        offscreenVideo.onerror = reject;
      });

      // Start playing the offscreen video
      await offscreenVideo.play().catch((err) => {
        console.error("Offscreen video play failed:", err);
      });

      // Create a canvas matching video dimensions
      canvas = document.createElement("canvas");
      canvas.width = offscreenVideo.videoWidth;
      canvas.height = offscreenVideo.videoHeight;
      ctx = canvas.getContext("2d");

      // Draw frames continuously with horizontal flip
      // eslint-disable-next-line no-unused-vars
      let animationFrameId;
      function drawFrame() {
        try {
          if (ctx) {
            ctx.save();
            ctx.scale(-1, 1); // horizontal flip
            ctx.drawImage(offscreenVideo, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();
            animationFrameId = requestAnimationFrame(drawFrame);
          }
        } catch (error) {
          console.log(error.message);
        }
      }
      drawFrame();

      // Capture the canvas stream (use same FPS as video, if known)
      canvasStream = canvas.captureStream(30);
      // Copy audio tracks from the original stream to the canvas stream
      originalStream.getAudioTracks().forEach((track) => {
        canvasStream.addTrack(track);
      });
      // Now use the canvas stream for preview and recording
      currentStream = canvasStream;
      console.log("Using mirrored (canvas) stream for recording.");
    }

    // Set preview
    videoPreview.value.style.display = "block";
    AdjustCameraScreenSize();
    videoPreview.value.srcObject = currentStream;

    // Start recording using MediaRecorder
    startMediaRecorder("video");
    Is_Video_Recording.value = true;
    recordAudioButton.value.disabled = true;
  } catch (error) {
    console.error("Error accessing camera:", error);
  }
}

function Toggle_Torch() {
  try {
    if (Current_Video_Stream_Track.value) {
      if (Is_FlashLight_Supported.value) {
        Current_Video_Stream_Track.value.applyConstraints({
          advanced: [{ torch: Is_FlashLight_On.value }],
        });
      } else {
        Show_Create_Edit_Model_Warning(
          `Device ${Is_Front_Camera_In_Use.value ? "Front Camera" : "Back Camera"
          } Does Not Support Flash Light!`,
          2000
        );
      }
    } else {
      Show_Create_Edit_Model_Warning("Please Start Video Recording First!", 2000);
    }
  } catch (error) {
    console.log(error.message);
  }
}

// Start audio recording
async function startAudioRecording() {
  if (currentStream) stopStream(currentStream);
  /* Close_Video_Audio_Preview(); */
  const constraints = { audio: true };

  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    overlayElement.value.style.display = "flex";
    startMediaRecorder("audio");
    Is_Audio_Recording.value = true;
    recordVideoButton.value.disabled = true;
  } catch (error) {
    console.error("Error accessing microphone:", error);
    Show_Create_Edit_Model_Warning("Microphone Access Denied, Please Allow it and Try Again.", 3000);
  }
}

let timeOut = null;
// Start MediaRecorder with robust MIME type checking
function startMediaRecorder(type) {
  try {
    console.log(Max_Accumulated_Attachments_Size.value);

    if (
      Max_Accumulated_Attachments_Size.value > 0 &&
      Max_Accumulated_Attachments_Size.value <=
      Max_Accumulated_Attachments_Size_Buffer.value
    ) {
      Disable_Done_Btn(true);

      // Get a supported MIME type based on the recording type.
      supportedMime.value = getSupportedMimeType(type);
      if (!supportedMime.value) {
        console.error("No supported MIME type found for", type);
        Show_Create_Edit_Model_Warning(
          `Recording failed: no supported MIME type for ${type}`,
          2000
        );
        return;
      }

      // Initialize MediaRecorder with the supported MIME type.
      mediaRecorder = new MediaRecorder(currentStream, {
        mimeType: supportedMime.value,
      });
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.value.push(event.data);
      };
      mediaRecorder.onstop = () => saveRecording();
      mediaRecorder.start();

      mediaRecorder.onerror = (e) =>
        Show_Critical_Error("Failed, Recording Not Started ", e);
      // Automatically stop recording after the time limit
      let timeLimit =
        type === "video"
          ? Media.value.Video_Stop_Duration
          : Media.value.Audio_Stop_Duration; // 20 sec for video, 5 min for audio
      console.log("--> recccc " + timeLimit);
      console.log("--> stateeee " + mediaRecorder.state);

      if (timeOut) clearTimeout(timeOut);

      timeOut = setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          stopRecording(timeOut);
          timeOut = null;
        }
      }, timeLimit);
    } else {
      stopRecording(timeOut);
      Show_Create_Edit_Model_Warning(
        `Failed, Clear Previous Attachments And Recordings!`,
        3000
      );
      return;
    }
    //////
  } catch (error) {
    console.log(error.message);
  }
}

// Stop recording
function stopRecording(timeOut) {
  try {
    console.log("Stopping recording...");
    // Turn off the device keyboard
    if (document.activeElement) {
      document.activeElement.blur();
    }
    //
    if (timeOut) clearTimeout(timeOut);
    if (mediaRecorder) mediaRecorder.stop();
    //mediaRecorder = null;
    if (currentStream) stopStream(currentStream);
    if (originalStream) stopStream(currentStream);
    if (canvasStream) stopStream(currentStream);
    if (Current_Video_Stream_Track.value) {
      Current_Video_Stream_Track.value.stop();
      Current_Video_Stream_Track.value = null;
    }
    Is_Video_Recording.value = false;
    Is_Audio_Recording.value = false;
    recordVideoButton.value.disabled = false;
    recordAudioButton.value.disabled = false;
    Disable_Done_Btn(false);
    overlayElement.value.style.display = "none";
  } catch (error) {
    console.log(error.message);
  }
}

// Stop stream tracks
function stopStream(stream) {
  try {
    // Turn off the device keyboard
    if (document.activeElement) {
      document.activeElement.blur();
    }
    //
    stream.getTracks().forEach((track) => {
      track.stop();
      track.dispatchEvent(new Event("ended"));
      track.enabled = false;
      track._destroy = true; // Poison pill
      delete stream[track.id];
    });

    Object.keys(stream).forEach((key) => delete stream[key]);
    stream = null;
    // Clean up canvas-related objects
    if (offscreenVideo) {
      offscreenVideo.pause();
      offscreenVideo.srcObject = null;
    }
    // Turn off the device keyboard
    if (document.activeElement) {
      document.activeElement.blur();
    }
    //
    if (canvasStream) canvasStream.getTracks().forEach((track) => track.stop());
    currentStream = null;
    originalStream = null;
    offscreenVideo = null;
    canvas = null;
    canvasStream = null;
    ctx = null;
    videoPreview.value.srcObject = null;
    videoPreview.value.style.display = "none";
    // Turn off the device keyboard
    if (document.activeElement) {
      document.activeElement.blur();
    }
  } catch (error) {
    console.log(error.message);
  }
}

let blob = ref(null);
let Video_Audio_Url = ref(null);
let Arr_Bfr = null;
// Save the recording
async function saveRecording() {
  try {
    // Turn off the device keyboard
    if (document.activeElement) {
      document.activeElement.blur();
    }
    //
    let AudioStorageRef = EditMode.value ? Edit_Mode_AudioStorage : AudioStorage;
    let VideoStorageRef = EditMode.value ? Edit_Mode_VideoStorage : VideoStorage;

    blob.value = new Blob(recordedChunks.value, {
      type: supportedMime.value.replace(/,opus|,vorbis/g, ""),
    });
    recordedChunks.value.splice(0, recordedChunks.value.length); // releasing resouces
    recordedChunks.value.length = 0; // Reset the array
    recordedChunks.value = []; // Reassign to an empty array

    console.log("final blob--> ", blob.value);

    let Id = `${blob.value.type.includes("audio")
      ? `media_AudioRec_${++i}_Attached___${Date.now()}`
      : `media_VideoRec_${++j}_Attached___${Date.now()}`
      }`;
    let Order = `${blob.value.type.includes("audio")
      ? ++Media_Object_Count.value.audio
      : ++Media_Object_Count.value.video
      }`;

    Video_Audio_Url.value = createTrackedObjectURL(
      blob.value,
      Id,
      EditMode.value ? "Edit_Mode" : "Create_Mode"
    );
    if (!Video_Audio_Url.value) Show_Critical_Error("Url Generation Failed ");
    console.log("url: ", Video_Audio_Url.value);

    Arr_Bfr = await Blob_To_Array_Buffer(blob.value);

    // Update the Audio UI and Array to reflect the new audio attachment
    if (blob.value.type.includes("audio")) {
      AudioStorageRef.value.push({
        name: `AudioRec_${i}_Attached`,
        Data: Arr_Bfr,
        Type: "audio",
        Size: blob.value.size,
        timestamp: Date.now(),
        deletion: false,
        id: Id,
      });
      await Editor_Media_Adding_Parser(
        Tiptap_Editor,
        Order,
        `AudioRec_${i}_Attached`,
        Video_Audio_Url.value,
        "audio",
        Id,
        `loader_${Id}`,
        'local',
        false, // Is Media Pasted from Clipboard HTML 
      );
      console.log("Audio recording saved.");

      // Update the Video UI and Array to reflect the new audio attachment
    } else if (blob.value.type.includes("video")) {
      VideoStorageRef.value.push({
        name: `VideoRec_${j}_Attached`,
        Data: Arr_Bfr,
        Type: "video",
        Size: blob.value.size,
        timestamp: Date.now(),
        deletion: false,
        id: Id,
      });
      await Editor_Media_Adding_Parser(
        Tiptap_Editor,
        Order,
        `VideoRec_${j}_Attached`,
        Video_Audio_Url.value,
        "video",
        Id,
        `loader_${Id}`,
        'local',
        false, // Is Media Pasted from Clipboard HTML
      );
      console.log("Video recording saved.");
      // Handle unknown media types
    } else {
      console.error("Unknown media type:", blob.value.type);
    }
    // ✅ Deduct size BEFORE inserting to editor
    Max_Accumulated_Attachments_Size.value -= blob.value.size;

  } catch (error) {
    console.log(error.message);
    blob.value = null;
    Arr_Bfr = null;
    Video_Audio_Url.value = null;
    URL.revokeObjectURL(Video_Audio_Url.value); // 🟢 Revoke on error
  } finally {
    blob.value = null;
    Arr_Bfr = null;
    Video_Audio_Url.value = null;
  }
}

function Blob_To_Array_Buffer(blob) {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(blob);
      reader.onloadend = () => resolve(reader.result); // reader.result is a arr bfr.
      reader.onerror = () => reject(new Error("Blob to Array Buffer Conversion Failed"));
    });
  } catch (error) {
    console.log(error.message);
  } finally {
    blob = null;
  }
}

/* --------------------------- */

function Cleaning(Id) {
  try {

    Tiptap_Editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'media' && node.attrs.id === Id) {
        Tiptap_Editor.chain().deleteRange({ from: pos, to: pos + node.nodeSize })
          .run();
        console.log("Media node removed successfully");
      }
    });
    let record = urlRegistry.get(Id);
    if (record) {
      URL.revokeObjectURL(record.url);
      urlRegistry.delete(Id);
      console.log("URL revoked and registry entry deleted for ID:", Id);
    }
  } catch (error) {
    console.log(error.message);
  }
}

function delete_media(index, type) {
  try {
    console.log(index + " " + type);

    let storage, editStorage;

    // Determine which storage to use based on type
    switch (type) {
      case "video":
        storage = VideoStorage;
        editStorage = Edit_Mode_VideoStorage;
        break;
      case "audio":
        storage = AudioStorage;
        editStorage = Edit_Mode_AudioStorage;
        break;
      case "image":
        storage = images;
        editStorage = Edit_Mode_images;
        break;
      case "doc":
        storage = DocumentStorage;
        editStorage = Edit_Mode_DocumentStorage;
        break;
      default:
        console.log("Invalid media type:", type);
        return;
    }

    // Select the appropriate list based on Edit Mode
    let list = EditMode.value ? editStorage : storage;

    if (!list.value[index]) {
      throw new Error(`Item at index ${index} not found.`);
    }

    let item = list.value[index];
    let Id = item.id;

    // Restore attachment size
    Max_Accumulated_Attachments_Size.value += item.Size;

    if (EditMode.value) {
      data.value[CurrentIndex.value].Attachment_Used_Size += item.Size;
    }

    // Mark for deletion
    item.deletion = true;

    // Wait for animation, then remove item
    Delete_Note_Sound.play();
    setTimeout(() => {
      list.value.splice(index, 1);
    }, 300);

    // Update UI message
    if (Id) {
      Cleaning(Id);
    }

  } catch (error) {
    console.log(`Error deleting ${type}:`, error.message);
  }
}

// Configure slugify
function normalizeString(input) {
  try {
    return slugify(input, {
      replacement: "_", // replace spaces/specials with underscore
      remove: /[^a-zA-Z0-9_]/g, // remove anything not alphanumeric or underscore
      lower: true, // keep case
      trim: true, // trim leading/trailing underscores
    });
  } catch (error) {
    console.log(error.stack);
    debugError(error, "Method");
  }
}

function readFileAsync(file, asText = false) {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;

      if (asText) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  } catch (error) {
    console.log(error.stack);
    debugError(error, "Method");
  }
}


async function manageMedia(
  file,
  pasting = false,
  Is_Image_From_Pasted_Html_Content = false
) {
  let selectedFile = null;
  let fileType = "";
  let fileName = "";
  let fileSize = 0;
  let fileData = null;
  try {
    selectedFile = pasting ? file : file.target.files[0];

    if (!selectedFile) {
      Tiptap_Editor.commands.focus();
      return;
    } // Exit if no file was selected

    // Check if file size exceeds allowed maximum
    if (selectedFile.size >= (Is_Select_Type_OCR.value
      ? 100 * 1024 * 1024   // 100 MB in bytes
      : Max_Accumulated_Attachments_Size.value)) {

      let warning = Is_Select_Type_OCR.value
        ? `Max Supported Size is 100 MB!`
        : (
          Max_Accumulated_Attachments_Size.value >= Max_Accumulated_Attachments_Size_Buffer.value
            ? `Max Supported Size is ${(Max_Accumulated_Attachments_Size_Buffer.value / 1024 / 1024).toFixed(1)} MB!`
            : `${Math.max((Max_Accumulated_Attachments_Size.value / 1024 / 1024).toFixed(1), 0)} MB Capacity Limit Left!`
        );

      Show_Create_Edit_Model_Warning(warning, 3000);
      pasting ? (file = null) : (fileInput_tag_ref.value.value = ""); // Reset file input
      return;
    }

    Disable_Done_Btn(true);

    // Check if the file type is supported
    const fileInfo = await getRealFileInfo(selectedFile);

    const isSupportedMedia = SupportedMedia.value.includes(fileInfo.mime);
    const isSupported = isSupportedMedia || fileInfo.category === 'text' || fileInfo.category === 'document';

    if (!isSupported) {
      Show_Create_Edit_Model_Warning("File Not Supported!", 1500);
      pasting ? (file = null) : (fileInput_tag_ref.value.value = "");
      return;
    }

    // getting save cursor position place token.

    // Determine which storage to use and the file category (text, image, video, audio, document)
    let storage = null;
    let storageType = "";

    switch (fileInfo.category) {
      case "text":
        storageType = "text";
        break;

      case "image":
        storage = EditMode.value ? Edit_Mode_images : images;
        storageType = "image";
        break;

      case "video":
        storage = EditMode.value ? Edit_Mode_VideoStorage : VideoStorage;
        storageType = "video";
        break;

      case "audio":
        storage = EditMode.value ? Edit_Mode_AudioStorage : AudioStorage;
        storageType = "audio";
        break;

      case "document":
        storage = EditMode.value ? Edit_Mode_DocumentStorage : DocumentStorage;
        storageType = "document";
        break;

      default:
        // Should never reach here because of isSupported check
        storageType = "unknown";
    }

    // If the file belongs to one of the storages, check for duplicates (same name & size)
    if (storage) {
      const alreadyAdded = storage.value.some(
        (item) => item.name === selectedFile.name && item.Size === selectedFile.size
      );
      if (alreadyAdded) {
        console.log("File already added, skipping duplicate");
        Show_Create_Edit_Model_Warning("File Already Added!", 1500);
        pasting ? (file = null) : (fileInput_tag_ref.value.value = ""); // Reset file input
        return;
      }
    }


    // OCR operation we will delegate file to some other will future method.

    if (Is_Select_Type_OCR.value) {
      if (!["image", "document"].includes(storageType)) {
        Show_Create_Edit_Model_Warning("Only Images and Documents Supported for OCR!", 3000);
        return;
      }
      else {
        await Handle_OCR(selectedFile);
        Is_Select_Type_OCR.value = false;
        return;
      }
    }

    // Use different reading methods based on file type
    if (storageType === "text") {
      if (Paste_Procssing.value) {
        console.warn("New Input blocked: already processing.");
        Show_Create_Edit_Model_Warning('New File blocked: already processing previous.', 3000);
        return;
      }
      const result = await handleTextFileInsertion(selectedFile);
      if (!result.success) Show_Create_Edit_Model_Warning('Text File Insertion Failed!', 3000);
      //
    } else {
      fileData = await readFileAsync(selectedFile, false);
      fileType = fileInfo.mime;
      fileName = normalizeString(selectedFile.name);
      fileSize = selectedFile.size;


      // Usage:
      if (["image", "video", "audio", "document"].includes(storageType)) {
        await addMediaToStorage(
          storage,
          fileName,
          fileData,
          fileType,
          fileSize,
          storageType,
          Is_Image_From_Pasted_Html_Content
        );
      }
      // Deduct the size of the added file from the max attachments size
      Max_Accumulated_Attachments_Size.value -= fileSize;
    }
  } catch (error) {
    console.log(error.message);
  } finally {
    selectedFile = null;
    !pasting ? (fileInput_tag_ref.value.value = null) : (pasting = ""); // Reset file input
    file = null;
    fileType = "";
    fileName = "";
    fileSize = 0;
    fileData = null;
    Is_Select_Type_OCR.value = false;
    Paste_Procssing.value = false;
    Disable_Done_Btn(false);
    if (!isTouchFirst.value) Tiptap_Editor.commands.focus();
  }
}



async function handleTextFileInsertion(selectedFile) {
  if (!selectedFile) return { success: false };

  const sizeMB = (selectedFile.size / 1024 / 1024).toFixed(1);

  // ── 1. HARD LIMIT ─────────────────────────────────────────────
  if (selectedFile.size > MAX_TEXT_SIZE_HARD) {
    Show_Create_Edit_Model_Warning(`Text File Too Large, Attach as Document instead!`, 6000);
    return { success: true, action: "offer_as_document" };
  }

  // ── 2. SOFT WARNING ───────────────────────────────────────────
  if (selectedFile.size > MAX_TEXT_SIZE_WARNING) {
    const proceed = confirm(
      `\nThis text file is large (${sizeMB} MB / ~${Math.round(selectedFile.size / 1024)} KB).\n\n` +
      `It may feel slower when editing or scrolling.\n\n` +
      `Continue anyway?`
    );
    if (!proceed) return { success: true };
  }

  try {
    Paste_Procssing.value = true;

    // Small yield so spinner is visible before heavy work
    await new Promise(r => requestAnimationFrame(r));

    const fileData = await readFileAsync(selectedFile, true);

    // Show nice message for large files
    if (fileData.length > LARGE_TEXT_THRESHOLD) {
      Show_Create_Edit_Model_Warning("Large text file — inserting as paragraphs...", 3000);
      await new Promise(r => setTimeout(r, 40));
    }

    let lines = fileData.split(/\r?\n/);

    // Extra safety: truncate if somehow over limit
    if (lines.length > MAX_ALLOWED_LINES) {
      lines.length = MAX_ALLOWED_LINES;
      lines.push("\n\n[File, Number of Lines Trimmed]");
      lines.push(`[Text File, ${MAX_ALLOWED_LINES} Are Max Allowed Lines]\n\n`);
    }

    // Convert to Tiptap paragraph nodes
    const paragraphNodes = lines.map(line => ({
      type: 'paragraph',
      content: line.trim() ? [{ type: 'text', text: line }] : []
    }));

    // Fast bulk insert
    Tiptap_Editor.chain().insertContent(paragraphNodes).focus().run();

    if (editorLenis) editorLenis.resize();

    return { success: true };

  } catch (error) {
    console.error("Text file insertion failed:", error);
    Show_Create_Edit_Model_Warning("Failed to insert text file", 3000);
    return { success: false };
  } finally {
    Paste_Procssing.value = false;
  }
}


let Media_Object_Count = ref({
  image: 0,
  video: 0,
  audio: 0,
  document: 0,
});

async function addMediaToStorage(
  storage,
  fileName,
  fileData,
  fileType,
  fileSize,
  StorageType,
  Is_Image_From_Pasted_Html_Content = false
) {
  let blob;
  let url;
  try {
    let Order = ++Media_Object_Count.value[StorageType];
    let Id = `media_${fileName}_${StorageType}_${Order}___${Date.now()}`;

    storage.value.push({
      name: fileName,
      Data: fileData,
      Type: fileType,
      Size: fileSize,
      timestamp: Date.now(),
      deletion: false,
      order: Order,
      id: Id,
    });

    blob = new Blob([fileData], {
      type: fileType || "application/octet-stream",
    });

    url = createTrackedObjectURL(blob, Id, EditMode.value ? "Edit_Mode" : "Create_Mode");

    await Editor_Media_Adding_Parser(
      Tiptap_Editor,
      Order,
      fileName,
      url,
      StorageType,
      Id,
      `loader_${Id}`,
      'local',
      Is_Image_From_Pasted_Html_Content // Is Media Pasted from Clipboard HTML
    );
    // reset
    fileData = null;
  } catch (error) {
    console.log(error.message);
  } finally {
    blob = null;
    url = null;
  }
}

function generateRandomColor() {
  try {
    let hue = Math.floor(Math.random() * 360); // Full range of colors
    let saturation = Math.floor(Math.random() * (90 - 70 + 1)) + 70; // 80-100% saturation
    let lightness = Math.floor(Math.random() * (60 - 45 + 1)) + 45; // 50-70% lightness
    let opacity = 0.85; // Soft transparency

    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
  } catch (error) {
    console.log(error.message);
  }
}

// ..... Generate same but deep color for card title this CardTitleColor also give color to card itself .......
function AddNoteBtn() {
  try {
    inputData.value = "";
    SearchBtnLogic();
    Note_heading_element.value.textContent = "Create Note";
    EditMode.value = false;
    if (temp_for_save_Create_Note_Text_if_available_parallelly.value.length) {
      CurrentlyWritingTitle.value =
        temp_for_save_Create_Note_Text_if_available_parallelly.value[0];
      Tiptap_Editor.commands.setContent(
        temp_for_save_Create_Note_Text_if_available_parallelly.value[1]
      );
    }
    Create_Edit_Btn_Sound.play();
    isAddBtnPressed.value = true;
    Blur_Background_WhileOpening_Note.value = true;
    document.body.classList.add("disable_body_scroll_on_note_full_screen");
    if (
      focusOnInput.value &&
      Tiptap_Editor.view.dom.innerHTML === '<p data-placeholder="Write Your Thoughts /" class="is-empty is-editor-empty"><br class="ProseMirror-trailingBreak"></p>' &&
      Tiptap_Editor.view.dom.innerText.trim() === ""
    ) {
      setTimeout(() => {
        focusOnInput.value.focus();
        document.body.classList.add("disable_body_scroll_on_note_full_screen");
      }, 400);
    } else {
      setTimeout(() => {
        Tiptap_Editor.commands.focus();
        document.body.classList.add("disable_body_scroll_on_note_full_screen");
      }, 400);
    }
    /*    Always_Space_At_Beginning_of_Editor(); */
  } catch (error) {
    console.log(error.message);
  }
}

async function Get_Media_from_Db(id) {
  let media = null;
  let Get_Decompressed_Media = null;
  try {
    media = await db.media.get(id); // Wait for the media to be fetched
    if (!media) {
      console.log("No media found");
      return null;
    }
    Get_Decompressed_Media = await Decompresion_Worker(media.blob, false); // Wait for processing
    console.log("Decompressed_Media ", Get_Decompressed_Media);
    return Get_Decompressed_Media;
  } catch (error) {
    console.log(error.message);
    return null;
  } finally {
    console.log(
      "Cleaning up media after get from database and decompressed it for RO_..."
    );
    media = null;
    Get_Decompressed_Media = null;
  }
}

function generateMediaURLs(mediaArray, source) {
  let blob = null;
  let url = null;
  try {
    mediaArray.forEach((media) => {
      if (media && media.Data instanceof ArrayBuffer) {
        // Create a Blob from the ArrayBuffer, using the provided Type if available.
        blob = new Blob([media.Data], {
          type: media.Type || "application/octet-stream",
        });
        // Create a URL from the Blob.
        url = createTrackedObjectURL(blob, media.id, source);
        // Nullify the Data property to free the memory.
        media.Attachments_Url = url;
      }
    });
    return mediaArray;
  } catch (error) {
    console.log(error.message);
  } finally {
    blob = null;
    url = null; // erase the copy url (points to blob);
  }
}

// RO_View_Mode.
function make_checkbox_readonly(html) {
  try {
    return html.replace(/<input\s+type="checkbox"([^>]*)>/gi, (match, attrs) => {
      // Check if the original input had "checked"
      const isChecked = /\bchecked\b/i.test(attrs);
      // Replace with a custom span symbol
      return isChecked
        ? '<span class="readonly-checkbox">☑</span>'
        : '<span class="readonly-checkbox">☐</span>';
    });
  } catch (error) {
    console.error(error.stack);
    debugError(error, "Method");
  }
}

function Clean_Array_And_Blob_Links(arr) {
  try {
    arr.forEach((item) => {
      if (
        item.Attachments_Url &&
        typeof item.Attachments_Url === "string" &&
        item.Attachments_Url.startsWith("blob")
      ) {
        URL.revokeObjectURL(item.Attachments_Url);
        item.Attachments_Url = null;
      }
    });
    arr.splice(0, arr.length);
    arr.length = 0;
  } catch (error) {
    console.log("Error in Clean_Array_And_Blob_Links:", error.message);
  }
}

// Cleans all media link arrays and decompressed media.
function RO_View_Mode_Array_And_Links_Cleaner() {
  try {
    // Clean each media array.
    if (IsRoViewNoteOpen.value) {
      [SendImageForView, SendVideoForView, SendAudioForView, SendDocumentForView].forEach(
        (mediaArray) => {
          if (mediaArray && mediaArray.length) {
            Clean_Array_And_Blob_Links(mediaArray);
          }
        }
      );
    }
  } catch (error) {
    console.log("Error in RO_View_Mode_Array_And_Links_Cleaner:", error.message);
  }
}



let Opening_note_In_view_mode_progressing = ref(false);

async function RO_ViewNotePage(id) {

  const index = data.value.findIndex(n => n.id === id) // index

  let Html_String;
  let RO_View_Mode_Pull_Decompressed_Media_From_Index_DB = null;
  let Final_Media_Embedded_Html_String;
  let mediaElements = null;
  try {
    if (Opening_note_In_view_mode_progressing.value) return;

    // Cancel any pending close timeout from previous operation
    if (pendingCloseTimeout) {
      clearTimeout(pendingCloseTimeout);
      pendingCloseTimeout = null;
    }

    closeSidebar();
    Opening_note_In_view_mode_progressing.value = true;
    data.value[index].IsLoading = true;
    await new Promise(r => requestAnimationFrame(r));
    await new Promise((resolve) => setTimeout(resolve, 5));
    updateRefreshKey();
    Blur_Background_WhileOpening_Note.value = true;
    View_Btn_Sound.play();
    SendNoteForView_Title.value = data.value[index].title;
    Html_String = data.value[index].userWroteHtml;
    Html_String = make_checkbox_readonly(Html_String);
    SendNoteForView_Message.value = Animation_Smoother_For_Edit_And_View_Mode(
      Animate_Visiual_Block_View(Html_String)
    );
    change_text_alignment();

    IsRoViewNoteOpen.value = true;
    /*     await new Promise(r => requestAnimationFrame(r)); */
    await new Promise((resolve) => setTimeout(resolve, 450));
    data.value[index].IsLoading = false;
    if (Toggle_Reading_Form_Full_Screen.value)
      document.body.classList.add("disable_body_scroll_on_note_full_screen");


    RO_View_Mode_Pull_Decompressed_Media_From_Index_DB = await Get_Media_from_Db(data.value[index].id);

    if (RO_View_Mode_Pull_Decompressed_Media_From_Index_DB) {
      // Start with base HTML for chaining updates
      Final_Media_Embedded_Html_String = await handleViewMode(Html_String, RO_View_Mode_Pull_Decompressed_Media_From_Index_DB);
      SendNoteForView_Message.value = Animation_Smoother_For_Edit_And_View_Mode(Final_Media_Embedded_Html_String);
      //


      await new Promise(r => requestAnimationFrame(r));
      Render_Read_Mode_Charts(Note_View_UI_Text_Element.value);
      await new Promise(r => requestAnimationFrame(r));
      //900000
      await nextTick();
      //
      mediaElements = Array.from(Note_View_UI_Text_Element.value.querySelectorAll("img, video, audio"));
      Opening_note_In_view_mode_completed.value = true;
      await Promise.all(mediaElements.map(el => runAnimation(el, true)));
      //

      if (viewLenis) viewLenis.resize();
      View_Note_Page_UI.value.focus();

      // Clean up the decompressed media object to free memory
      const mediaArrays = ["ImageFile", "AudioFiles", "VideoFiles", "DocumentFiles"];
      //
      mediaArrays.forEach((key) => {
        const arr = RO_View_Mode_Pull_Decompressed_Media_From_Index_DB.Data[key];
        console.log("RO mode cleaning key of temp array--> ", key);
        console.log("RO mode cleaning arr of temp array--> ", arr);
        if (Array.isArray(arr)) {
          arr.splice(0, arr.length); // Remove all elements
          RO_View_Mode_Pull_Decompressed_Media_From_Index_DB.Data[key].length = 0; // Force clear again
        }
      });
      //
      RO_View_Mode_Pull_Decompressed_Media_From_Index_DB = null;
    } else {
      await nextTick();

      mediaElements = Array.from(Note_View_UI_Text_Element.value.querySelectorAll(".ai-rich-block"));
      await Promise.all(mediaElements.map(el => run_visiual_block_animation(el)));

      await new Promise(r => requestAnimationFrame(r));
      Render_Read_Mode_Charts(Note_View_UI_Text_Element.value);
      await new Promise(r => requestAnimationFrame(r));

      // for online media if local is no found in array.
      mediaElements = Array.from(Note_View_UI_Text_Element.value.querySelectorAll("img, video, audio"));
      Opening_note_In_view_mode_completed.value = true;
      await Promise.all(mediaElements.map(el => runAnimation(el, true)));

      await new Promise((resolve) => setTimeout(resolve, 400));

      if (viewLenis) viewLenis.resize();
      View_Note_Page_UI.value.focus();
    }
  } catch (error) {
    RO_View_Mode_Pull_Decompressed_Media_From_Index_DB = null;
    await CloseBtn(null);
    console.log(error.message);
    debugError(error, "RO_View_Note");
  }
}
// RO_Mode_End.



async function handleViewMode(htmlString, dbMedia) {
  let finalHtml = htmlString;
  const mediaMap = {
    image: dbMedia.Data.ImageFile,
    audio: dbMedia.Data.AudioFiles,
    video: dbMedia.Data.VideoFiles,
    application: dbMedia.Data.DocumentFiles
  };

  Object.entries(mediaMap).forEach(([type, arr]) => {
    if (arr.length > 0) {
      const Media_Arr_With_Urls = generateMediaURLs(arr, "View_Mode");
      finalHtml = updateMediaSources(finalHtml, Media_Arr_With_Urls, type);
    }
  });
  return finalHtml;
}


function updateMediaSources(htmlString, mediaArray, mediaType) {
  try {
    let temp = document.createElement("div");
    temp.innerHTML = htmlString;

    // Loop through media objects
    mediaArray.forEach((obj) => {
      console.log(obj.Type.split("/")[0]);
      if (obj.Type.split("/")[0] === mediaType) {
        // Find wrapper div by id
        const wrapper = temp.querySelector(`#${obj.id}`);
        if (wrapper) {
          // Find media tag inside wrapper
          const mediaTag = wrapper.querySelector(
            mediaType === "image" ? "img" : mediaType === "application" ? "a" : mediaType
          );
          if (mediaTag) {
            if (mediaType === "application")
              mediaTag.setAttribute("href", obj.Attachments_Url);
            else
              mediaTag.setAttribute("src", obj.Attachments_Url);
            //
            console.log(
              `✅ Updated ${mediaType} with id=${obj.id} → src=${obj.Attachments_Url}`
            );
          } else {
            console.log(`⚠️ No <${mediaType}> tag found inside wrapper id=${obj.id}`);
          }
        } else {
          console.log(`⚠️ No wrapper found for id=${obj.id}`);
        }
      }
    });
    // Return updated HTML string
    return temp.innerHTML;
  } catch (error) {
    console.log(error.stack);
    debugError(error, "Method");
  }
}


function Disable_Done_Btn(disable = false) {

  if (disable) {
    DisableDoneBtnElement.value.disabled = true;
    DisableDoneBtnElement.value.style.backgroundColor = "#d9ae38";
  }
  else {
    DisableDoneBtnElement.value.disabled = false;
    DisableDoneBtnElement.value.style.backgroundColor = "#d9ae38";
  }
}


async function EditBtn(index) {
  let isLargeNote = false;
  let Media_Free_Json = null;
  //
  try {
    Toggle_MarkDown_Menu.value = false;
    Note_heading_element.value.textContent = "Edit Note";
    disable_color_notes_switcher_btn.value = false;
    Note_Create_Close_btn.value.style.display = "none";
    Create_Edit_Btn_Sound.play();

    EditMode.value = true;
    Blur_Background_WhileOpening_Note.value = true;
    CurrentIndex.value = index;

    // Save pending create note if any
    if (Tiptap_Editor.view.dom.innerText.trim() !== "" || Tiptap_Editor.view.dom.innerHTML !== "" || CurrentlyWritingTitle.value?.length) {
      temp_for_save_Create_Note_Text_if_available_parallelly.value[0] = CurrentlyWritingTitle.value;
      temp_for_save_Create_Note_Text_if_available_parallelly.value[1] = Tiptap_Editor.getJSON();
    }

    Tiptap_Editor.commands.clearContent(true);

    Save_The_Create_Notes_Max_Accu_Attachment_Capacity_While_Switching_To_Edit_Note.value = Max_Accumulated_Attachments_Size.value;
    Max_Accumulated_Attachments_Size.value = data.value[index].Attachment_Used_Size;

    CurrentlyWritingTitle.value = data.value[index].title;

    isAddBtnPressed.value = true;           // ← UI starts opening + animation
    Disable_Done_Btn(true);

    //
    await new Promise(r => requestAnimationFrame(r)); // let Vue paint the loader
    await new Promise(r => setTimeout(r, 400));   // let animation finish smoothly

    let Note_Json_Object_For_Edit_Mode = data.value[index].userWroteJson;

    const hasMedia = containsMedia(Note_Json_Object_For_Edit_Mode?.content ?? []);
    isLargeNote = Note_Json_Object_For_Edit_Mode.content?.length > 20 || hasMedia;

    if (hasMedia) {
      const clonedJson = JSON.parse(JSON.stringify(Note_Json_Object_For_Edit_Mode));
      Media_Free_Json = Remove_Dead_Link_Media_Nodes_From_Json(clonedJson);
    }

    // Decide if we need loading spinner

    if (isLargeNote) {
      Paste_Procssing.value = true;
      await new Promise(r => requestAnimationFrame(r)); // let Vue paint the loader
      await new Promise(r => setTimeout(r, 10));   // let animation finish smoothly
    }

    document.body.classList.add("disable_body_scroll_on_note_full_screen");

    // ==================== HEAVY WORK STARTS HERE (loading stays ON) ====================
    Tiptap_Editor.commands.setContent(hasMedia ? Media_Free_Json : Note_Json_Object_For_Edit_Mode);

    let Edit_Mode_Pull_Decompressed_Media_From_Index_DB = await Get_Media_from_Db(data.value[index].id);

    if (Edit_Mode_Pull_Decompressed_Media_From_Index_DB) {
      Note_Json_Object_For_Edit_Mode = await handleEditModeContent(Note_Json_Object_For_Edit_Mode, Edit_Mode_Pull_Decompressed_Media_From_Index_DB, { images: Edit_Mode_images, audio: Edit_Mode_AudioStorage, video: Edit_Mode_VideoStorage, document: Edit_Mode_DocumentStorage });

      Tiptap_Editor.commands.setContent(Note_Json_Object_For_Edit_Mode);

      if (Edit_Mode_Pull_Decompressed_Media_From_Index_DB.Id) {
        terminateAllWorkers("view", Edit_Mode_Pull_Decompressed_Media_From_Index_DB.Id);
        Edit_Mode_Pull_Decompressed_Media_From_Index_DB.Id = null;
      }
      Edit_Mode_Pull_Decompressed_Media_From_Index_DB = null;
    }

    if (editorLenis) editorLenis.resize();

    // ==================== ONLY NOW hide loader ====================
    if (isLargeNote) {
      Paste_Procssing.value = false;
    }

    if (editorLenis) editorLenis.resize();
    Disable_Done_Btn(false);
    console.log("Edit_Mode_images ", Edit_Mode_images.value);
    console.log("Edit_Mode_AudioStorage ", Edit_Mode_AudioStorage.value);
    console.log("Edit_Mode_VideoStorage ", Edit_Mode_VideoStorage.value);
    console.log("Edit_Mode_DocumentStorage ", Edit_Mode_DocumentStorage.value);
  } catch (error) {
    console.log(error.message);
    if (isLargeNote) Paste_Procssing.value = false; // safety
    Disable_Done_Btn(false);
  }
}



function containsMedia(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) return false;

  const stack = [nodes];

  while (stack.length) {
    const currentLevel = stack.pop();


    for (let i = 0; i < currentLevel.length; i++) {
      const node = currentLevel[i];

      if (!node || typeof node !== "object") continue;

      if (node.type === "media" && node.attrs.source !== "online") {
        return true;
      }

      const content = node.content;
      if (Array.isArray(content) && content.length > 0) {
        stack.push(content);
      }
    }
  }
  return false;
}


async function handleEditModeContent(noteJson, dbMedia, storages) {
  if (!dbMedia) {
    // Fallback: just return the JSON you already have
    return noteJson;
  }

  // Map DB keys to reactive storages
  const storageMap = {
    ImageFile: storages.images,
    AudioFiles: storages.audio,
    VideoFiles: storages.video,
    DocumentFiles: storages.document,
  };

  // Hydrate storages from DB
  Object.entries(storageMap).forEach(([key, ref]) => {
    const arr = dbMedia.Data[key];
    if (Array.isArray(arr)) {
      arr.forEach(el => {
        ref.value.push(el);
        console.log("db note item", el);
      });
      ref.value = generateMediaURLs(ref.value, "Edit_Mode");
    }
  });

  // Update JSON with refreshed URLs
  const updatedJson = updateNoteMediaUrls(noteJson, [
    storages.images,
    storages.audio,
    storages.video,
    storages.document,
  ]);


  // Cleanup DB arrays
  Object.keys(storageMap).forEach(key => {
    const arr = dbMedia.Data[key];
    if (Array.isArray(arr)) {
      arr.length = 0;
    }
  });

  dbMedia = null;

  return updatedJson;
}



function Remove_Dead_Link_Media_Nodes_From_Json(clonedJson) {
  if (!clonedJson || typeof clonedJson !== "object") return clonedJson;

  // Use a stack to walk through all nodes
  const stack = [clonedJson];

  while (stack.length > 0) {
    const node = stack.pop();

    if (node && Array.isArray(node.content)) {
      // Filter out media nodes directly
      node.content = node.content.filter(child => child.type !== "media");

      // Push remaining children onto stack for further processing
      node.content.forEach(child => {
        if (child && typeof child === "object") {
          stack.push(child);
        }
      });
    }
  }

  return clonedJson;
}


function updateNoteMediaUrls(noteJson, storages) {
  // Flatten storages into a lookup map
  const mediaMap = {};
  storages.forEach(storageRef => {
    toRaw(storageRef.value).forEach(item => {
      mediaMap[item.id] = item.Attachments_Url;
    });
  });

  // Recursive update
  function updateNode(node) {
    const rawNode = toRaw(node); // unwrap proxy
    if (rawNode.type === "media" && rawNode.attrs && mediaMap[rawNode.attrs.id]) {
      rawNode.attrs.src = mediaMap[rawNode.attrs.id];
    }
    if (rawNode.content) {
      rawNode.content = rawNode.content.map(updateNode);
    }
    return rawNode;
  }

  const updatedNote = {
    ...toRaw(noteJson),
    content: toRaw(noteJson.content).map(updateNode),
  };

  // Return plain object (no proxies)
  return JSON.parse(JSON.stringify(updatedNote));
}




const deleteTimeouts = reactive(new Map());

async function Handle_Undo(event) {
  try {
    // get wrapper and noteId from data attribute (safer than relying on index)
    const wrapper = event.target.closest(".card_wrapper");
    const noteId = wrapper?.getAttribute("data-id");
    if (!noteId) return;

    // find index in the reactive array
    const idx = data.value.findIndex((it) => String(it.id) === noteId);
    if (idx === -1) {
      return;
    }

    data.value[idx].isCardGoingDeleted = false;

    await new Promise((resolve) => setTimeout(resolve, 300));
    const card = wrapper.querySelector(".cards");
    const Undo = wrapper.querySelector(".undo-card");
    card.style.display = "flex";
    Undo.style.display = "none";

    const timeoutId = deleteTimeouts.get(parseInt(noteId));
    if (timeoutId) {
      clearTimeout(timeoutId);
      deleteTimeouts.delete(parseInt(noteId));
    }
  } catch (error) {
    console.log(error.stack);
    debugError(error, "Method");
  }
}



async function DeleteCard(event, index) {
  try {

    const wrapper = event.target.closest(".card_wrapper");
    let noteId = parseInt(wrapper.getAttribute("data-id")) || data.value[index].id;
    const card = wrapper.querySelector(".cards");
    const Undo = wrapper.querySelector(".undo-card");
    hideNoteFooterMenu();

    // find note object by id and toggle its going to delted proprty to true
    data.value.forEach(n => {
      if (n.id === noteId) {
        n.isCardGoingDeleted = true;
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 300));
    card.style.display = "none";
    Undo.style.display = "flex";

    // create and store timeout for this specific note
    const timeoutId = setTimeout(async () => {
      // find current index for this id (guard against reordering/deletes)
      const idx = data.value.findIndex((it) => it.id === noteId);
      // if item already removed or undo pressed, abort
      if (idx === -1) {
        deleteTimeouts.delete(noteId);
        return;
      }
      if (data.value[idx].isCardGoingDeleted) {
        await DeleteNote(noteId);
        data.value.splice(idx, 1);
        deleteTimeouts.delete(noteId);
        // remove DOM wrapper if still present
        const wrapperNow = document.querySelector(`.card_wrapper[data-id="${noteId}"]`);
        if (wrapperNow) wrapperNow.remove();
      }
    }, 5000);

    deleteTimeouts.set(noteId, timeoutId);
  } catch (error) {
    console.log(error.message);
  }
}



function resetToggles() {
  Toggle_Heading.value = false;
  Toggle_Font_Size.value = false;
  Toggle_Line_Spacing.value = false;
  Toggle_Text_Alignment.value = false;
  Toggle_link.value = false;
  link.value = { url: "" };
  Toggle_Font_Color.value = false;
  Toggle_Highlight_Color.value = false;
  Toggle_Block_Background_Color.value = false;
  Toggle_Table_Cell_Background_Color.value = false;
}


// ........................ This Big function for save data when save or done buton pressed ..........................
async function DoneBtn() {
  try {
    fullyCloseSTT();
    fully_close_prompt_STT();
    stopEverything();
    Stop_AI_Generation();
    Stop_OCR();

    // ......................... function for save data when in editing mode ..............................
    if (EditMode.value) {
      await Edit_Mode_Done_Btn();
    }
    // .................. function for save data when in new card creating mode ............................
    else {
      await Create_Note_Done_Btn();
    }
    if (document.body.classList.contains("disable_body_scroll_on_note_full_screen"))
      document.body.classList.remove("disable_body_scroll_on_note_full_screen");
    setTimeout(() => {
      All_Storage_DS_Logs();
    }, 30000);
  } catch (error) {
    console.log(error.message);
  }
}

async function Edit_Mode_Done_Btn() {
  try {
    if (isTouchFirst.value)
      await waitForKeyboardClose(200);
    if (!EditMode.value || CurrentIndex.value === undefined) {
      console.error("Edit mode is not active or currentIndex is undefined.");
      alert("Cannot save: Edit mode not properly initialized.");
      stopRecording();
      Stop_All_Playing_Media("Create_Edit_Mode");

      Reset_Media_Object();
      isAddBtnPressed.value = false; // Close the modal
      Blur_Background_WhileOpening_Note.value = false;
      storage_capacity_checker();
      return;
    }
    if (
      Tiptap_Editor.view.dom.innerText.trim() !== "" ||
      CurrentlyWritingTitle.value.trim() !== ""
    ) {
      // Capture the index locally
      const currentIndex = CurrentIndex.value;

      data.value[currentIndex].userWroteHtml = Tiptap_Editor.view.dom.innerHTML;

      data.value[currentIndex].userWroteJson = Tiptap_Editor.getJSON();
      data.value[currentIndex].title = CurrentlyWritingTitle.value;
      let currentDate = new Date();
      let formattedDate = currentDate.toLocaleDateString();
      data.value[currentIndex].NotesDate = formattedDate;
      data.value[currentIndex].IsLoading = true;
      data.value[currentIndex].WorkSpaceId = selectedWorkspaceId.value;
      data.value[currentIndex].SubGroupId = selectedSubgroup.value;


      stopRecording();
      Stop_All_Playing_Media("Create_Edit_Mode");
      //
      let edit_note_media_object = Working_Along_Side_With_Done_Btn(
        data.value[currentIndex].id
      );

      CurrentlyWritingTitle.value = null;
      Tiptap_Editor.commands.clearContent(true);

      isAddBtnPressed.value = false;
      Blur_Background_WhileOpening_Note.value = false;
      data.value[currentIndex].Attachment_Used_Size = Max_Accumulated_Attachments_Size.value;
      Max_Accumulated_Attachments_Size.value = Save_The_Create_Notes_Max_Accu_Attachment_Capacity_While_Switching_To_Edit_Note.value;
      Note_Create_Close_btn.value.style.display = "block";
      EditMode.value = false;
      Toggle_Table_Menu.value = false;
      disable_color_notes_switcher_btn.value = true;

      let response_note = null;
      let response_media = null;
      // saving note object to DB.
      console.log("1. Note Object ", data.value[currentIndex]);
      console.log("2. sending note id to db", data.value[currentIndex].id);
      response_note = await Compresion_Worker(data.value[currentIndex], "note", "update");
      // saving media objec to DB.
      console.log("17. created note_media_object", edit_note_media_object);
      console.log("18. sending media to db?");
      if (
        edit_note_media_object &&
        (edit_note_media_object.ImageFile.length > 0 ||
          edit_note_media_object.VideoFiles.length > 0 ||
          edit_note_media_object.AudioFiles.length > 0 ||
          edit_note_media_object.DocumentFiles.length > 0)
      ) {
        console.log("18. sending media id to db", data.value[currentIndex].id);
        response_media = await Compresion_Worker(
          edit_note_media_object,
          "media",
          "update"
        );
        console.log("19. response_media ", response_media);
        console.log("20. response_note ", response_note);
      }
      console.log("21. finishing loading");
      //
      data.value[currentIndex].IsLoading = false;
      //
      edit_note_media_object = null;
      //

      console.log("24. stopped all media playing and save it");
      Reset_Media_Object();
      console.log("25. reset media object");
      purgeObjectURLs(null, "Edit_Mode");
      console.log("26. purged object urls");
      //
      console.log("22. going to terminate after loading finished");
      terminateAllWorkers("save", response_note?.Id, response_media?.Id);
      console.log("23. terminated");
      //
      cleanupMediaListeners(Tiptap_Editor);
      Clear_Editor_KeyPress_Media_Selection(Tiptap_Editor);
      //
      hyperClean();
      //
      storage_capacity_checker();
      console.log("27. storage capacity checked");
    } else {
      Show_Create_Edit_Model_Warning("Write Something, Dont Leave It Empty.", 1500);
      Tiptap_Editor.commands.focus();
      return;
    }
  } catch (error) {
    console.log(error.message);
    stopRecording();
    Stop_All_Playing_Media("Create_Edit_Mode");
    Reset_Media_Object();
    purgeObjectURLs(null, "Edit_Mode");
    terminateAllWorkers("save");
    cleanupMediaListeners(Tiptap_Editor);
    Clear_Editor_KeyPress_Media_Selection(Tiptap_Editor);
    hyperClean();
    storage_capacity_checker();
  }
  finally {
    data.value[CurrentIndex.value].IsLoading = false;
    CurrentIndex.value = null;
    resetToggles();
  }
}



async function Create_Note_Done_Btn() {

  let note_And_media_id = Date.now() + Math.floor(Math.random() * 1000000); // Unique ID

  try {
    if (isTouchFirst.value)
      await waitForKeyboardClose(200);

    if (
      Tiptap_Editor.view.dom.innerText.trim() !== "" ||
      CurrentlyWritingTitle.value.trim() !== ""
    ) {
      let currentDate = new Date();
      let formattedDate = currentDate.toLocaleDateString();
      let gettingColor = generateRandomColor();
      let result = gettingColor.slice(0, -5) + "1.0)";
      // modifying html to mark checkboxes checked state properly.
      /*       let marked_checkbox_html = getHTMLWithCheckedStates(Tiptap_Editor.getHTML()); */
      let tiptap_html = Tiptap_Editor.view.dom.innerHTML;
      let html_with_wrapped_tables = getTableHTMLWithWrapper(tiptap_html);
      //.................................. Object For Array To Make New Cards .................................

      Note_Object = {
        title: CurrentlyWritingTitle.value,
        userWroteJson: Tiptap_Editor.getJSON(),
        userWroteHtml: html_with_wrapped_tables,
        NotesDate: formattedDate,
        isCardGoingDeleted: false,
        IsLoading: true,
        id: note_And_media_id,
        Card_Title_Color: Is_Sticky_Colorful_Card.value ? result : "rgb(68 68 68)",
        Card_Para_Color: Is_Sticky_Colorful_Card.value ? gettingColor : "rgb(46 46 46)",
        Card_Footer_Color: Is_Sticky_Colorful_Card.value ? result : "rgb(68 68 68)",
        Attachment_Used_Size: Max_Accumulated_Attachments_Size.value,
        TimeStamp: new Date().toISOString(),
        ManualOrder: null,
        isFav: false,
        WorkSpaceId: selectedWorkspaceId.value,
        SubGroupId: selectedSubgroup.value,
      };

      stopRecording();
      Stop_All_Playing_Media("Create_Edit_Mode");
      console.log("24. stopped all media");
      let create_note_media_object = Working_Along_Side_With_Done_Btn(note_And_media_id);
      Tiptap_Editor.commands.clearContent(true);
      CurrentlyWritingTitle.value = null;

      //.............................................Here Pushing object To Array ................................
      Toggle_Table_Menu.value = false;
      isAddBtnPressed.value = false;
      Blur_Background_WhileOpening_Note.value = false;
      Max_Accumulated_Attachments_Size.value =
        Max_Accumulated_Attachments_Size_Buffer.value;
      temp_for_save_Create_Note_Text_if_available_parallelly.value.splice(
        0,
        temp_for_save_Create_Note_Text_if_available_parallelly.value.length
      );
      ///
      let response_note = null;
      let response_media = null;
      console.log("1. Note Object ", Note_Object);
      console.log("2. sending note id to db", note_And_media_id);

      response_note = await Compresion_Worker(Note_Object, "note", "save");
      if (
        create_note_media_object &&
        (create_note_media_object.ImageFile.length > 0 ||
          create_note_media_object.VideoFiles.length > 0 ||
          create_note_media_object.AudioFiles.length > 0 ||
          create_note_media_object.DocumentFiles.length > 0)
      ) {
        console.log("17. create_note_media_object", create_note_media_object);
        console.log("18. sending media id to db", note_And_media_id);

        response_media = await Compresion_Worker(
          create_note_media_object,
          "media",
          "save"
        );
      }
      console.log("19. response_note ", response_note);
      console.log("20. response_media ", response_media);
      console.log("21. finishing loading");
      data.value[data.value.findIndex((n) => n.id == response_note.id)].IsLoading = false;
      create_note_media_object = null;
      Newly_Created_Notes_Id_For_Backend_To_Avoid_Send_Them_During_pagination.value.push(
        note_And_media_id
      );
      //
      console.log("25. reset media object");
      Reset_Media_Object();
      console.log("22. going to terminate after loading finished");
      terminateAllWorkers("save", response_note?.Id, response_media?.Id);
      console.log("23. terminated");
      purgeObjectURLs(null, "Create_Mode");
      console.log("26. purged object urls");
      hyperClean();
      // remove media selection event.
      cleanupMediaListeners(Tiptap_Editor);
      Clear_Editor_KeyPress_Media_Selection(Tiptap_Editor);

      //
      storage_capacity_checker();
      console.log("27. storage capacity checked");
      /*       stop_all_media(); */
    }
    //..............................Error If It Found Inputs Fields Are Empty .....................................
    else {
      Show_Create_Edit_Model_Warning("Write Something, Dont Leave It Empty.", 1500);
      Tiptap_Editor.commands.focus();
      return;
    }
  } catch (error) {
    console.log("Error in Create_Note_Done_Btn: ", error.message);
    console.log(error.message);
    stopRecording();
    Stop_All_Playing_Media("Create_Edit_Mode");
    Reset_Media_Object();
    terminateAllWorkers("save");
    purgeObjectURLs(null, "Create_Mode");
    cleanupMediaListeners(Tiptap_Editor);
    Clear_Editor_KeyPress_Media_Selection(Tiptap_Editor);
    hyperClean();
    storage_capacity_checker();
  }
  finally {
    data.value[data.value.findIndex((n) => n.id == note_And_media_id)].IsLoading = false;
    note_And_media_id = null;
    resetToggles();
  }
}


function getTableHTMLWithWrapper(html) {

  if (!html || typeof html !== 'string' || !html.trim()) {
    return html;
  }

  // Parse HTML into real DOM (safest way)
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Find ALL tables (even if user manually added them)
  const tables = doc.querySelectorAll('table');

  tables.forEach(table => {
    // Skip if table is already wrapped (prevents double wrapping)
    if (table.parentElement && table.parentElement.classList.contains('tableWrapper')) {
      return;
    }

    const wrapper = doc.createElement('div');
    wrapper.className = 'tableWrapper';

    // Replace table with wrapper → then put table inside wrapper
    table.parentNode.replaceChild(wrapper, table);
    wrapper.appendChild(table);
  });

  return doc.body.innerHTML;
}


/// scanner method to remove unrelated attachmet propostion to html media attachments.

function removeOrphanedMedia(htmlString, mediaType, mediaArray) {
  try {
    if (!mediaArray.length) return mediaArray;
    // Create a temporary DOM element to parse the HTML string
    let temp = document.createElement("div");
    temp.innerHTML = htmlString;

    mediaArray.forEach((object) => {
      console.log("---Before Going To erase Unrealted Objects in array size: " + mediaArray.length + " Object: " + object);
    });

    // Define selectors for each media type (using div wrappers with type-specific classes)
    const selectors = {
      image: "div.img.override_media_position_in_live_editor[id]",
      audio: "div.audio.override_media_position_in_live_editor[id]",
      video: "div.video.override_media_position_in_live_editor[id]",
      document: "div.document.override_media_position_in_live_editor[id]",
    };

    // Map to store extracted IDs per type
    const idsByType = new Map([
      ["image", new Set()],
      ["audio", new Set()],
      ["video", new Set()],
      ["document", new Set()],
    ]);

    // Extract IDs for all types
    Object.keys(selectors).forEach((type) => {
      const elements = temp.querySelectorAll(selectors[type]);
      elements.forEach((el) => {
        const id = el.getAttribute("id");
        if (id) {
          idsByType.get(type).add(id);
        }
      });
    });

    // Get the extracted IDs for the specified mediaType
    const relevantIds = idsByType.get(mediaType) || new Set();

    // Filter the mediaArray to remove orphans: keep only objects where id exists in relevantIds and Type matches mediaType (if present)
    const filteredArray = mediaArray.filter((obj) => {
      // Assuming obj has 'id' and optionally 'Type'
      /*     const objType = obj.Type ? obj.Type.split('/')[0] : mediaType; // Fallback to mediaType if no Type */
      return obj.id && relevantIds.has(obj.id);
    });

    filteredArray.forEach((object) => {
      console.log("---After erase Unrealted Objects in array size: " + filteredArray.length + " Object: " + object);
    });

    // Return the modified array
    return filteredArray;
  } catch (error) {
    console.log(error.stack);
    debugError(error, "Method");
  }
}
///

let media_object = ref({
  id: null,
  ImageFile: [], // Array itself is non-reactive
  AudioFiles: [],
  VideoFiles: [],
  DocumentFiles: [],
});

/////////
function Working_Along_Side_With_Done_Btn(create_edit_note_id) {
  try {
    let editor_html = '';


    if (EditMode.value) {
      console.log("Editmode Enter in Done Helper");
      media_object.value.id = create_edit_note_id;
      editor_html = Tiptap_Editor.getHTML();

      processNoteMedia(editor_html, media_object.value, "Edit", {
        image: Edit_Mode_images,
        audio: Edit_Mode_AudioStorage,
        video: Edit_Mode_VideoStorage,
        document: Edit_Mode_DocumentStorage,
      });
    }
    else {
      console.log("Note Create Mode Enter in Done Helper");
      media_object.value.id = create_edit_note_id;
      editor_html = Tiptap_Editor.getHTML();

      processNoteMedia(editor_html, media_object.value, "Create", {
        image: images,
        audio: AudioStorage,
        video: VideoStorage,
        document: DocumentStorage,
      });

      data.value.push(Note_Object); // Add the new note to the main list
    }

    toggle_delete_model.value = false;
    Done_Btn_Sound.play();
    console.log("\n images array-> ", images.value);
    console.log("\n audio array-> ", AudioStorage.value);
    console.log("\n video array-> ", VideoStorage.value);
    console.log("\n document array-> ", DocumentStorage.value);
    console.log("\n Edit-Mode-images array-> ", Edit_Mode_images.value);
    console.log("\n Edit-Mode-AudioStorage array-> ", Edit_Mode_AudioStorage.value);
    console.log("\n Edit-Mode-VideoStorage array-> ", Edit_Mode_VideoStorage.value);
    console.log("\n Edit-Mode-DocumentStorage array-> ", Edit_Mode_DocumentStorage.value);
    console.log("\n Media Object ", media_object.value);

    return media_object.value;
  } catch (error) {
    console.error(
      "An error occurred in Working_Along_Side_With_Done_Btn:",
      error.message
    );
  }
}



function processNoteMedia(editorHtml, mediaObject, mode, storages) {
  // storages: { image, audio, video, document }
  const typeMap = {
    image: { source: storages.image, target: mediaObject.ImageFile },
    audio: { source: storages.audio, target: mediaObject.AudioFiles },
    video: { source: storages.video, target: mediaObject.VideoFiles },
    document: { source: storages.document, target: mediaObject.DocumentFiles },
  };

  Object.entries(typeMap).forEach(([type, { source, target }]) => {
    // Remove orphaned media from reactive array
    source.value = removeOrphanedMedia(editorHtml, type, source.value);

    // Update super object and clear old storage
    updateAndClearStorage(source.value, target);
  });

  console.log(`${mode} Mode media processed`);
}


// move items from source to target and clear source
function updateAndClearStorage(source, target) {
  source.forEach((item) => {
    console.log("Loop items ", item);
    target.push(item);
    console.log("Target ", target);
  });
  source.splice(0, source.length); // Clear the source after transfer
  source.length = 0; // Force clear again
  source = []; // Drop reference for GC
  console.log("Cleaning Arrays ", source);
};


function Editor_Keyboard_Actions(event) {
  if (event.key === "Escape" && toggle_delete_model.value) {
    toggle_delete_model.value = false;
    return;
  }

  if (event.key === "Escape" && Toggle_Keyboard_Shortcut_UI.value) {
    Close_kbd_UI();
    return;
  }

  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'k') {
    event.preventDefault()           // Prevent browser default (if any)
    Render_kbd_UI();
  }

  if (
    event.key === "Escape" &&
    (Show_Choice_Dialog.value ||
      Show_Type_Dialog.value ||
      Show_Overlay.value ||
      Show_Url_Dialog.value)
  ) {
    cancelDialog();
    return;
  }
  /*       if (
    event.key === "Escape" &&
    editor.value.$el.focus &&
    !toggle_delete_model.value &&
    !Show_Choice_Dialog.value &&
    !Show_Type_Dialog.value &&
    !Show_Url_Dialog.value &&
    !Toggle_Keyboard_Shortcut_UI.value
  ) {
    CloseBtn(null, "note_making", null);
    return;
  } */
  if (
    event.key == "Enter" &&
    event.ctrlKey &&
    Tiptap_Editor.view.dom.focus &&
    !toggle_delete_model.value &&
    !Show_Choice_Dialog.value &&
    !Show_Type_Dialog.value &&
    !Show_Url_Dialog.value &&
    !Toggle_Keyboard_Shortcut_UI.value
  ) {
    event.preventDefault(); // Prevent default newline behavior
    DoneBtn();
    return;
  }
}


async function View_UI_keyboard_Actions(event) {
  if (event.key === "Escape" && View_Note_Page_UI.value.focus) {
    await CloseBtn(null);
  }
}

function editor_title_input_keyboard_Action(event) {
  if (event.key === "Enter") {
    Tiptap_Editor.commands.focus(); // Shift focus to the note input box
  } else if (event.key == "Enter" && event.ctrlKey) {
    event.preventDefault(); // Prevent default newline behavior
    DoneBtn();
  }
}
//.................................. A Function To Move Cursor, Enter to Save ...........................................
function Handle_Keyboard_Events() {
  try {
    Note_Making_UI_Element.value.addEventListener("keyup", Editor_Keyboard_Actions);
    // notes container dialog box
    note_view_ui_element.value.addEventListener("keyup", View_UI_keyboard_Actions);

    focusOnInput.value.addEventListener("keyup", editor_title_input_keyboard_Action)

  } catch (error) {
    console.log(error.message);
  }
}

let Making_Debounce = debounce(SearchBtnLogic, 200);

function SearchBtnLogic() {
  try {
    console.log("calling seach method");

    // Search input event listener
    let data = inputData.value.toLowerCase();
    let notesFound = false; // Flag to check if any notes match

    if (Card.value) {
      Card.value.forEach((card_wrapper) => {
        let card = card_wrapper.children[0];
        if (card) {
          let title = card.children[0].firstChild.textContent.toLowerCase().trim();
          let description = card.children[1].firstChild.textContent.toLowerCase().trim();
          let datetime = card.children[3].firstChild.textContent.toLowerCase().trim();
          if (
            title.includes(data) ||
            description.includes(data) ||
            datetime.includes(data) ||
            inputData.value === ""
          ) {
            card.style.display = "flex";
            setTimeout(() => {
              card.classList.remove("smoothhide");
            }, 100);
            notesFound = true; // At least one note matches
          } else {
            card.classList.add("smoothhide");
            setTimeout(() => {
              card.style.display = "none";
            }, 200);
          }
        }
      });
      // Toggle "No Notes Found" message
      if (!notesFound) {
        Is_No_Notes_Found_Message.value = true;
      } else {
        Is_No_Notes_Found_Message.value = false;
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

function AdjustCameraScreenSize() {
  try {
    if (!videoPreview.value || !videoPreview.value.style) return;
    videoPreview.value.style.width = Tiptap_Editor.view.dom.offsetWidth + "px"; // Append "px"
    videoPreview.value.style.height = Tiptap_Editor.view.dom.offsetHeight + "px"; // Append "px"
  } catch (error) {
    console.log(error.message);
  }
}


const Video_Array = computed(() => {
  const baseArr = EditMode.value ? Edit_Mode_VideoStorage.value : VideoStorage.value;
  console.log("Video Array in computed =>", baseArr);
  return baseArr.filter((item) => item.name.trim() !== "");
});

const Audio_Array = computed(() => {
  const baseArr = EditMode.value ? Edit_Mode_AudioStorage.value : AudioStorage.value;
  console.log("Audio Array in computed =>", baseArr);
  return baseArr.filter((item) => item.name.trim() !== "");
});

const Image_Array = computed(() => {
  const baseArr = EditMode.value ? Edit_Mode_images.value : images.value;
  console.log("Image Array in computed =>", baseArr);
  return baseArr.filter((item) => item.name.trim() !== "");
});

const Document_Array = computed(() => {
  const baseArr = EditMode.value
    ? Edit_Mode_DocumentStorage.value
    : DocumentStorage.value;
  console.log("Document Array in computed =>", baseArr);
  return baseArr.filter((item) => item.name.trim() !== "");
});

const urlRegistry = new Map();

function createTrackedObjectURL(blob, Id, source) {
  let url = null;
  try {
    url = URL.createObjectURL(blob);
    console.log("url created by main ", url);
    urlRegistry.set(Id, {
      url,
      source,
      blob,
      created: Date.now(),
      stack: new Error().stack,
    });
    return url;
  } catch (error) {
    console.log(error.message);
  } finally {
    blob = null;
    url = null;
  }
}

function purgeObjectURLs(id = null, source = null) {
  const ts = () => new Date().toISOString();
  const sizeBefore = urlRegistry.size;

  console.log(`\n[${ts()}] ── PURGE START ───────────────────────────`);
  console.log(
    `[START] id=${id ?? "null"}, source=${source ?? "null"}, total=${sizeBefore}`
  );

  try {
    // ===========================================================
    // PURGE: ALL
    // ===========================================================
    if (!id && !source) {
      if (sizeBefore === 0) {
        console.log(`[INFO] No records to purge.`);
        console.log(`[${ts()}] ── PURGE END ─────────────────────────────\n`);
        return;
      }

      for (const [key, meta] of urlRegistry) {
        URL.revokeObjectURL(meta.url);
        meta.blob = null;

        console.log(`[ALL] deleted key="${key}", url=${meta.url}, source=${meta.source}`);
      }

      urlRegistry.clear();

      console.log(`[ALL_DONE] Before=${sizeBefore}, After=${urlRegistry.size}`);
      console.log(`[${ts()}] ── PURGE END ─────────────────────────────\n`);
      return;
    }

    // ===========================================================
    // PURGE: BY ID
    // ===========================================================
    if (id) {
      if (urlRegistry.has(id)) {
        const meta = urlRegistry.get(id);

        URL.revokeObjectURL(meta.url);
        meta.blob = null;
        urlRegistry.delete(id);

        console.log(`[ID] key="${id}", url=${meta.url}, source=${meta.source}`);
        console.log(`[ID_DONE] Before=${sizeBefore}, After=${urlRegistry.size}`);
        console.log(`[${ts()}] ── PURGE END ─────────────────────────────\n`);
        return;
      }

      console.warn(`[ID_NOT_FOUND] id=${id}`);
      console.log(`[${ts()}] ── PURGE END ─────────────────────────────\n`);
      return;
    }

    // ===========================================================
    // PURGE: BY SOURCE
    // ===========================================================
    if (source) {
      let removed = 0;

      // iterate snapshot to avoid mutation issues
      const snapshot = Array.from(urlRegistry.entries());

      for (const [key, meta] of snapshot) {
        const idMissing = key === null || key === undefined || key === "" || key === 0;

        if (meta.source === source || idMissing) {
          // revoke + nullify
          URL.revokeObjectURL(meta.url);
          meta.blob = null;

          // delete by key
          const ok = urlRegistry.delete(key);

          if (ok) {
            console.log(
              `[SRC] deleted key="${key}", url=${meta.url}, source=${meta.source}`
            );
          } else {
            // fallback delete by meta reference (panic mode)
            let fallback = false;

            for (const [altKey, altMeta] of urlRegistry) {
              if (altMeta === meta) {
                urlRegistry.delete(altKey);
                console.warn(
                  `[SRC_FALLBACK] original_key="${key}", corrected_key="${altKey}"`
                );
                fallback = true;
                break;
              }
            }

            if (!fallback) {
              console.error(`[SRC_FAIL] Could not delete meta url=${meta.url}`);
            }
          }

          removed++;
        }
      }

      console.log(
        `[SRC_DONE] source=${source}, removed=${removed}, Before=${sizeBefore}, After=${urlRegistry.size}`
      );
      console.log(`[${ts()}] ── PURGE END ─────────────────────────────\n`);
      return;
    }

    // ===========================================================
    // NO MATCH CASE
    // ===========================================================
    console.log(`[NO_MATCH] id=${id}, source=${source}`);
  } catch (err) {
    console.error(`[ERROR] ${err.message}`, { id, source, stack: err.stack });
  } finally {
    console.log(`[FINISH] total_now=${urlRegistry.size}`);
    console.log(`[${ts()}] ── PURGE END ─────────────────────────────\n`);
  }
}

function Reset_Array_Connector() {
  [SendImageForView, SendAudioForView, SendVideoForView, SendDocumentForView].forEach(
    (Array) => {
      if (Array && Array.length) {
        Array.splice(0, Array.length); // clear in-place
        Array.length = 0; // clear in-place
      }
    }
  );
}

function Reset_Create_View_And_Edit_Mode_Storage() {
  try {
    // all arrays wrapped in refs
    [
      Edit_Mode_VideoStorage,
      Edit_Mode_AudioStorage,
      Edit_Mode_images,
      Edit_Mode_DocumentStorage,
      //
      VideoStorage,
      AudioStorage,
      images,
      DocumentStorage,
    ].forEach((refArray) => {
      if (refArray && "value" in refArray) {
        refArray.value.splice(0, refArray.value.length); // clear in-place
        refArray.value.length = 0; // clear in-place
      }
    });
    Reset_Array_Connector();
  } catch (error) {
    console.log(error.stack);
    debugError(error, "Method");
  }
}

// Add memory guard to critical functions
async function memoryGuard() {
  try {
    if (Used_Storage_Capacity_Percentage.value > 90) {
      Show_Critical_Error(`Warning! Storage is Above 95% Usage.`);
    }
    if (Used_Storage_Capacity_Percentage.value > 95) {
      Show_Critical_Error(`Warning! 95% Limit Reached, Please Free The Storage`);
      /* stopRecording();
      nukeDOMMedia();
      Reset_Media_Object();
      RO_View_Mode_Array_And_Links_Cleaner();
      Reset_Create_View_And_Edit_Mode_Storage();
      terminateAllWorkers();
      terminateAllWorkers("save");
      terminateAllWorkers("view");
      terminateAllWorkers();
      purgeObjectURLs();
      db.delete();
      hyperClean();
      location.reload(); // Nuclear option */
    }
  } catch (error) {
    console.log(error.message);
  }
}
// Run periodically
setInterval(memoryGuard, 300000);

async function Manage_Model_Using_Ui_gesture() {
  try {
    console.log("fired...");
    if (isAddBtnPressed.value) {
      await CloseBtn("note_making");
      return true;
    } else if (IsRoViewNoteOpen.value) {
      await CloseBtn(null);
      return true;
    } else if (inputData.value.length > 0) {
      reset_searchbar();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error.message);
  }
}

async function handlePopState() {
  try {
    // If any UI element is open, close it and push state back to prevent route change
    if (await Manage_Model_Using_Ui_gesture()) {
      console.log("fire in");
      history.pushState(null, document.title, window.location.href);
    } else {
      if (window.location.pathname === "/") {
        console.log("default");
        /* empty */
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

function cleanupEditorMedia() {
  try {
    const mediaEls = editor.value.$el.querySelectorAll("img, video, audio"); // Or via wrappers
    mediaEls.forEach((el) => {
      console.log("unmounting editor media");
      el.src = "";
      el.removeEventListener("loadeddata", runAnimation);
      el.removeEventListener("load", runAnimation);
      // Reset styles if needed
      el.style.transform = "";
      // Hide loaders, etc.
    });
  } catch (error) {
    console.log(error.stack);
    debugError(error, "Method");
  }
}

function checkViewport() {
  Toggle_Mobile_View.value = window.innerWidth <= 768
};

function On_Resize() {
  checkViewport();
  AdjustCameraScreenSize();
}


function shouldConfirmPageExit() {
  const searchHasText = (inputData.value?.trim?.() ?? "").length > 0;
  const noteCreateEditOpen = !!isAddBtnPressed.value;
  const noteViewOpen = !!IsRoViewNoteOpen.value;
  const workspaceModalOpen = !!showModal.value || !!Editing_Workspace.value;
  const workspaceSelectorOpen = !!showWorkspaceSelector.value;
  const paginationLoading = !!More_Notes_Are_Coming.value;
  const noteDeleteInProgress = (deleteTimeouts?.size ?? 0) > 0 || !!toggle_delete_model.value;
  return (searchHasText || noteCreateEditOpen || noteViewOpen || workspaceModalOpen || workspaceSelectorOpen || paginationLoading || noteDeleteInProgress);
}

function handleBeforeUnload(event) {
  if (!shouldConfirmPageExit()) return;
  event.preventDefault();
  event.returnValue = "You have an active note or dialog open. Are you sure you want to leave?";
}



onBeforeUnmount(() => {

  window.removeEventListener("beforeunload", handleBeforeUnload);

  All_Storage_DS_Logs();
  //
  stopRecording();
  cleanupEditorMedia();
  terminateAllWorkers();
  purgeObjectURLs();
  nukeDOMMedia();

  cleanupMediaListeners(Tiptap_Editor);
  Clear_Editor_KeyPress_Media_Selection(Tiptap_Editor);
  window.removeEventListener("popstate", handlePopState);
  //
  if (editorRafId) cancelAnimationFrame(editorRafId);
  if (viewRafId) cancelAnimationFrame(viewRafId);
  Tiptap_Editor.view.dom.removeEventListener('keydown', handleEditorKeyboardScroll);
  Tiptap_Editor.view.dom.removeEventListener('load', resize_lenis_scroll_On_media_Adition);
  View_Note_Page_UI.value.removeEventListener('keydown', handleViewKeyboardScroll);
  if (editorLenis) editorLenis.destroy();
  if (viewLenis) viewLenis.destroy();
  window.removeEventListener("scroll", debouncedScroll); // 🟢 Add this
  Styling_Btns_Toolbar.value.removeEventListener('scroll', Toggle_Btn_And_Update_DropDown_Positions);
  Styling_Btns_Toolbar.value.removeEventListener('resize', Toggle_Btn_And_Update_DropDown_Positions);
  Table_Styling_Btns_Toolbar.value.removeEventListener('scroll', Toggle_Btn_And_Update_DropDown_Positions);
  Table_Styling_Btns_Toolbar.value.removeEventListener('resize', Toggle_Btn_And_Update_DropDown_Positions);
  window.removeEventListener("resize", On_Resize);
  Note_Making_UI_Element.value.removeEventListener("keyup", Editor_Keyboard_Actions);
  // notes container dialog box
  note_view_ui_element.value.removeEventListener("keyup", View_UI_keyboard_Actions);

  focusOnInput.value.removeEventListener("keyup", editor_title_input_keyboard_Action);
  if (Tiptap_Editor && Tiptap_Editor.commands) Tiptap_Editor.commands.clearContent(true);
  if (Tiptap_Editor && typeof Tiptap_Editor.destroy === "function") {
    Tiptap_Editor.destroy();
    console.log("Tiptap editor destroyed on unmount");
  };
  Observer.disconnect();
  stopStream(currentStream);
  Observer.disconnect();
  controller.abort();
  clearTimeout(debounceTimeout); // Add timeout cleanup

});


function click_outside_footer_menu_btns(event) {
  const target = event.target
  if (!target) return

  const clickedInsideMenu = target.closest(".notes_card_footer_btn_container") || target.closest(".notes_card_footer_menu_btns_container");
  const clickedTrigger = target.closest("notes_footer_menu_btn");

  if (!clickedInsideMenu && !clickedTrigger) {
    hideNoteFooterMenu();
  }
};




let SavedOrder = ref();
let OrderMap = ref();


onMounted(async () => {
  console.log("App mounted");
  terminateAllWorkers("save");
  terminateAllWorkers("view");
  terminateAllWorkers();
  stopRecording();
  Reset_Media_Object();
  RO_View_Mode_Array_And_Links_Cleaner();
  Reset_Create_View_And_Edit_Mode_Storage();
  purgeObjectURLs();
  nukeDOMMedia();
  hyperClean();
  //
  // Wait for editor to be available before mounting
  await nextTick();

  if (!editor.value.$el) {
    console.error("Editor element not found after nextTick");
    return;
  }

  checkViewport();
  initializeLenisScroll();
  await new Promise(resolve => setTimeout(resolve, 10));
  Tiptap_Editor.view.dom.classList.add("model_note");
  history.pushState(null, document.title, window.location.href);
  window.addEventListener("popstate", handlePopState);
  window.addEventListener("resize", On_Resize);
  Handle_Keyboard_Events();
  ////
  Is_Sticky_Colorful_Card.value = JSON.parse(
    localStorage.getItem("Colorful_Notes") || false
  ); // here we use json parse due to local storage return string and in case of boolean its bad.
  sort_order.value = localStorage.getItem("sort_order") || "desc";
  Alignment_index.value = localStorage.getItem("align_text") || 0;

  // ✅ Restore saved manual order
  let notes_order = localStorage.getItem("noteManualOrder");
  console.log(notes_order);
  if (notes_order) {
    SavedOrder.value = JSON.parse(notes_order);
    OrderMap.value = new Map(SavedOrder.value.map(item => [item.id, item.order]));
  }

  try {
    await acquireDBLock();

    await ensureDatabase();

    // Validate database health
    const isHealthy = await validateDatabase();
    if (!isHealthy) {
      console.warn("Database health check failed - attempting recovery");
    }
    await SeedNote_On_first_time_app_load();
    await fetchAllNotes();
  } catch (error) {
    console.error("Database initialization error:", error);
    Show_Critical_Error("Database initialization failed. Please reload the page.");
  } finally {
    releaseDBLock();
  }


  storage_capacity_checker();
  change_text_alignment();
  ///
  if (Tiptap_Editor.view.dom) {
    Observer = new MutationObserver(() => {
      try {
        if (editorLenis) editorLenis.resize();

      } catch (err) {
        // defensive: never let observer throw and stop observing
        console.error("Observer callback error", err);
      }
    });
  }
  //
  Observer.observe(Tiptap_Editor.view.dom, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  if (Styling_Btns_Toolbar.value) {
    Styling_Btns_Toolbar.value.addEventListener('scroll', Toggle_Btn_And_Update_DropDown_Positions);
    Styling_Btns_Toolbar.value.addEventListener('resize', Toggle_Btn_And_Update_DropDown_Positions);
  }
  if (Table_Styling_Btns_Toolbar.value) {
    Table_Styling_Btns_Toolbar.value.addEventListener('scroll', Toggle_Btn_And_Update_DropDown_Positions);
    Table_Styling_Btns_Toolbar.value.addEventListener('resize', Toggle_Btn_And_Update_DropDown_Positions);
  }
  ///
  window.addEventListener("scroll", debouncedScroll);
  /* SEO Realted  */
  if (import.meta.env.SSR) {
    document.dispatchEvent(new Event("render-complete"));
  }

  setManageMediaMethod(manageMedia);

  console.log('Tiptap official dom access: ' + Tiptap_Editor.view.dom)

  console.log('Direct editor ref dom access: ' + Tiptap_Editor.view.dom)

  console.log(Tiptap_Editor.view.dom === Tiptap_Editor.view.dom)
  // true if they’re the same node

  window.addEventListener("beforeunload", handleBeforeUnload);


  document.addEventListener("click", click_outside_footer_menu_btns);


});



onUnmounted(() => {
  All_Storage_DS_Logs();
  db.tables.forEach((table) => {
    if (table && typeof table.close === "function") {
      table.close();
    }
  });
  //
  stopRecording();
  cleanupEditorMedia();
  nukeDOMMedia();
  Reset_Media_Object();
  RO_View_Mode_Array_And_Links_Cleaner();
  Reset_Create_View_And_Edit_Mode_Storage();
  terminateAllWorkers("save");
  terminateAllWorkers("view");
  terminateAllWorkers();
  purgeObjectURLs();
  hyperClean();
  //
  data.value = [];
  media_object.value = null;
  // Close database using the shared instance manager
  closeDatabase();
  Observer.disconnect();
  controller.abort();
  stopStream(currentStream);
  Observer.disconnect();
  controller.abort();
  clearTimeout(debounceTimeout); // Add timeout cleanup

  window.removeEventListener("popstate", handlePopState);
  Tiptap_Editor.view.dom.removeEventListener('keydown', handleEditorKeyboardScroll);
  Tiptap_Editor.view.dom.removeEventListener('load', resize_lenis_scroll_On_media_Adition);
  View_Note_Page_UI.value.removeEventListener('keydown', handleViewKeyboardScroll);
  document.removeEventListener("click", click_outside_footer_menu_btns);
  editorLenis.destroy();
  viewLenis.destroy();
  Observer.disconnect();
  controller.abort();
  clearTimeout(debounceTimeout); // Add timeout cleanup
  Clear_Editor_KeyPress_Media_Selection(Tiptap_Editor);
  window.removeEventListener("scroll", debouncedScroll); // 🟢 Add this
  Styling_Btns_Toolbar.value.removeEventListener('scroll', Toggle_Btn_And_Update_DropDown_Positions);
  Styling_Btns_Toolbar.value.removeEventListener('resize', Toggle_Btn_And_Update_DropDown_Positions);
  Table_Styling_Btns_Toolbar.value.removeEventListener('scroll', Toggle_Btn_And_Update_DropDown_Positions);
  Table_Styling_Btns_Toolbar.value.removeEventListener('resize', Toggle_Btn_And_Update_DropDown_Positions);
  window.removeEventListener("resize", On_Resize);
  Note_Making_UI_Element.value.removeEventListener("keyup", Editor_Keyboard_Actions);
  // notes container dialog box
  note_view_ui_element.value.removeEventListener("keyup", View_UI_keyboard_Actions);

  focusOnInput.value.removeEventListener("keyup", editor_title_input_keyboard_Action);
  cleanupMediaListeners(Tiptap_Editor);
  controller.abort();
  //
  if (Tiptap_Editor && Tiptap_Editor.commands) Tiptap_Editor.commands.clearContent(true);
  if (Tiptap_Editor && typeof Tiptap_Editor.destroy === "function") {
    Tiptap_Editor.destroy();
    console.log("Tiptap editor destroyed on unmount");
  }
  //
  console.log("All workers terminated and object URLs purged.");
});



// Add to component unmount
onBeforeUnmount(() => {
  const domCemetery = document.createElement("div");
  domCemetery.id = "zombie_graveyard";
  document.body.appendChild(domCemetery);

  [videoPreview.value, overlayElement.value].forEach((el) => {
    if (el) {
      el.classList.add("deceased");
      domCemetery.appendChild(el.cloneNode(true));
      el.remove();
    }
  });

  setTimeout(() => {
    domCemetery.innerHTML = "";
    document.body.removeChild(domCemetery);
  }, 0);
});



function All_Storage_DS_Logs() {
  try {
    console.groupCollapsed("=== Storage & Workers Dump ===");

    // 1) Generic array logs
    [
      ["recordedChunks", recordedChunks.value],
      ["images", images.value],
      ["AudioStorage", AudioStorage.value],
      ["VideoStorage", VideoStorage.value],
      ["DocumentStorage", DocumentStorage.value],
    ].forEach(([name, arr]) => console.log(`${name} [${arr.length}]`, arr));

    // 2) Edit‑mode arrays
    console.group("Edit‑Mode Storages");
    [
      ["images", Edit_Mode_images.value],
      ["AudioStorage", Edit_Mode_AudioStorage.value],
      ["VideoStorage", Edit_Mode_VideoStorage.value],
      ["DocumentStorage", Edit_Mode_DocumentStorage.value],
    ].forEach(([name, arr]) => console.log(`${name} [${arr.length}]`, arr));
    console.groupEnd();

    // 3) View arrays
    console.group("View Storages");
    [
      ["SendImageForView", SendImageForView],
      ["SendAudioForView", SendAudioForView],
      ["SendVideoForView", SendVideoForView],
      ["SendDocumentForView", SendDocumentForView],
    ].forEach(([name, arr]) => console.log(`${name} [${(arr || []).length}]`, arr));
    console.groupEnd();

    // 4) media_object tables
    console.group("media_object");
    console.table(media_object.value.ImageFile);
    console.table(media_object.value.AudioFiles);
    console.table(media_object.value.VideoFiles);
    console.table(media_object.value.DocumentFiles);
    console.groupEnd();

    // 5) URL registry
    console.group("urlRegistry");
    urlRegistry.forEach((meta, url) => console.log(url, "→", meta));
    console.groupEnd();

    // 6) Worker registries
    console.group("workerRegistries.save");
    workerRegistries.save.forEach((worker, id) => console.log(id, worker));
    console.groupEnd();
    console.group("workerRegistries.view");
    workerRegistries.view.forEach((worker, id) => console.log(id, worker));
    console.groupEnd();

    // 7) Your new variables
    console.group("Additional Variables");
    console.log("blob:", blob.value);
    console.log("Video_Audio_Url:", Video_Audio_Url.value);
    console.log("Arr_Bfr:", Arr_Bfr);
    console.groupEnd();
    console.groupEnd(); // end root
  } catch (e) {
    debugError(e, "All_Storage_DS_Logs method");
  }
}

/* SEO Section */

const json_ld = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "url": "https://nexora-notes-document-maker.web.app/",
      "name": "Nexora",
      "headline": "Nexora — Rich Notes & Document Maker",
      "description": "Nexora is an offline-first rich notes & document maker with text/Markdown/HTML, all-media support, AI writing, image generation, voice tools, OCR & workspaces.",
      "applicationCategory": "ProductivityApplication",
      "browserRequirements": "Requires a modern web browser with JavaScript enabled",
      "keywords": ["notes app", "notes maker", "document maker", "rich text editor", "offline notes app", "Markdown notes", "HTML editor", "multimedia notes", "media attachments", "AI writing", "AI notes", "AI image generation", "voice notes", "speech-to-text", "text-to-speech", "OCR notes", "charts", "diagrams", "workspace notes", "PDF export", "document editor"],
      "featureList": ["Rich text editing", "Markdown support", "HTML content support", "All-media attachments", "Image, video, audio, and document attachments", "Drag-and-drop and paste media", "Audio and video recording", "AI-assisted writing", "AI image generation", "AI-generated charts and diagrams", "Speech-to-text", "Text-to-speech", "OCR text extraction", "Workspaces and subgroups", "Note search and filtering", "Favorites and note organization", "Drag-and-drop note reordering", "Read-only document view", "PDF export", "Offline-first storage", "Progressive Web App support", "Automatic note persistence", "Tables and multi-column layouts", "Code blocks and syntax highlighting", "Task lists and checklists", "Slash commands", "Undo and redo", "Keyboard shortcuts"],
      "installUrl": "https://nexora-notes-document-maker.web.app/",
      "screenshot": [
        {
          "@type": "ImageObject",
          "url": "https://nexora-notes-document-maker.web.app/Desktop.png",
          "caption": "Desktop interface preview"
        },
        {
          "@type": "ImageObject",
          "url": "https://nexora-notes-document-maker.web.app/Mobile.png",
          "caption": "Mobile interface preview"
        }
      ],
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "author": {
        "@type": "Person",
        "name": "AR",
        "url": "https://rehman-product-engineer.web.app/"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Nexora",
        "logo": {
          "@type": "ImageObject",
          "url": "https://nexora-notes-document-maker.web.app/note_512.png"
        }
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://nexora-notes-document-maker.web.app/"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Nexora?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nexora is an offline-first rich notes and document maker for creating, editing, organizing, and exporting content with text, Markdown, HTML, rich formatting, media, AI tools, voice tools, OCR, workspaces, charts, diagrams, and PDF export."
          }
        },
        {
          "@type": "Question",
          "name": "Is Nexora a notes app or a document editor?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nexora combines both. It is a rich notes and document maker that lets you create structured documents using plain text, Markdown, HTML, rich text formatting, tables, columns, media, AI-generated content, charts, diagrams, and other content blocks."
          }
        },
        {
          "@type": "Question",
          "name": "Does Nexora work offline?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Nexora is designed as an offline-first application. Notes, media, workspaces, and other local data are stored in the browser using IndexedDB, while service-worker caching enables the application to continue working when an internet connection is unavailable. Online connectivity is still required for cloud-based AI, OCR, and voice services."
          }
        },
        {
          "@type": "Question",
          "name": "Does Nexora support Markdown?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Nexora supports Markdown content alongside rich text, HTML, formatting, lists, tables, code blocks, headings, links, and other document elements."
          }
        },
        {
          "@type": "Question",
          "name": "Does Nexora support HTML content?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Nexora supports HTML content within its rich document editing workflow and can work with text, Markdown, and HTML content together."
          }
        },
        {
          "@type": "Question",
          "name": "What types of media can be added to Nexora notes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nexora supports a wide range of media attachments, including images, videos, audio files, PDFs, Word documents, Excel files, and other supported document formats. Media can be added from local files, URLs, drag and drop, paste, or supported recording tools."
          }
        },
        {
          "@type": "Question",
          "name": "How do I add media to a Nexora note?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Media can be added by selecting files through the attachment controls, dragging and dropping files into the editor, pasting supported content, or adding media from an online URL. Supported media is embedded directly into the note."
          }
        },
        {
          "@type": "Question",
          "name": "Can Nexora record audio and video?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Nexora can record audio from a microphone and video from a camera and insert the resulting media into notes. Supported camera controls can include front and rear camera switching and a device torch when available."
          }
        },
        {
          "@type": "Question",
          "name": "Does Nexora support speech-to-text and text-to-speech?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Nexora provides voice tools for both speech-to-text and text-to-speech. Speech can be transcribed into the editor or AI prompt fields, while selected text can be converted to spoken audio with playback controls and adjustable speed."
          }
        },
        {
          "@type": "Question",
          "name": "Can Nexora transcribe audio or images into text?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nexora provides speech-to-text for voice input and OCR for extracting text from supported images and scanned documents. OCR results can be processed into structured Markdown content."
          }
        },
        {
          "@type": "Question",
          "name": "What AI features does Nexora provide?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nexora provides AI-assisted writing actions such as improving, correcting, simplifying, summarizing, expanding, shortening, changing tone, and following custom prompts. It can also generate images and create charts and diagrams from selected content or instructions."
          }
        },
        {
          "@type": "Question",
          "name": "Can Nexora generate images with AI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Nexora can use AI image generation to create images from user instructions and insert the generated result directly into a note."
          }
        },
        {
          "@type": "Question",
          "name": "Can Nexora create charts and diagrams?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Nexora can generate visual content such as charts and diagrams with AI and render them directly inside notes. Supported visual blocks include Chart.js charts and Mermaid diagrams."
          }
        },
        {
          "@type": "Question",
          "name": "Can I organize notes into workspaces?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Nexora supports color-coded workspaces and nested subgroups for organizing notes. Notes can be filtered by workspace or subgroup, making it possible to maintain separate collections for different projects, subjects, or areas of work."
          }
        },
        {
          "@type": "Question",
          "name": "Can I search my notes in Nexora?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Nexora provides real-time search across note titles, content, and dates, allowing notes to be located quickly even when a large collection has been created."
          }
        },
        {
          "@type": "Question",
          "name": "Can I favorite and reorder notes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Notes can be marked as favorites and filtered using the favorites view. Notes can also be manually reordered using drag and drop, in addition to sorting by creation date."
          }
        },
        {
          "@type": "Question",
          "name": "Can I edit tables and columns in Nexora?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Nexora supports editable tables with row and column operations, cell formatting, merging and splitting cells, and other table controls. Documents can also be divided into two to six columns."
          }
        },
        {
          "@type": "Question",
          "name": "Does Nexora support code blocks?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Nexora supports inline code and code blocks with syntax highlighting, along with headings, lists, task lists, links, alignment, formatting, and other rich text features."
          }
        },
        {
          "@type": "Question",
          "name": "Can I export Nexora notes as PDF?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Nexora provides PDF export for notes and documents, including options for a light white-background version suitable for printing and a dark-background version."
          }
        },
        {
          "@type": "Question",
          "name": "Can I read a note without editing it?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Nexora provides a dedicated read-only view mode for viewing completed notes and documents without entering the editor. The view can also be expanded into a full-screen reading experience."
          }
        },
        {
          "@type": "Question",
          "name": "How are Nexora notes stored?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nexora stores notes and related local data in the browser using IndexedDB. Notes and media can be compressed in background workers to reduce storage usage, while the application provides storage usage information."
          }
        },
        {
          "@type": "Question",
          "name": "Does Nexora support undo after deleting a note?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. When a note is deleted, Nexora provides a five-second undo period during which the deletion can be cancelled and the note restored."
          }
        },
        {
          "@type": "Question",
          "name": "Does Nexora support keyboard shortcuts?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Nexora provides keyboard shortcuts for common editing, formatting, structure, alignment, list, undo and redo, and utility operations. A dedicated shortcuts dialog provides the complete shortcut list."
          }
        },
        {
          "@type": "Question",
          "name": "Is Nexora available as a Progressive Web App?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Nexora is built as a Progressive Web App and supports installation, offline caching, local persistence, and responsive use across desktop and mobile devices."
          }
        }
      ]
    },
    {
      "@type": "HowTo",
      "name": "How to Create and Manage a Rich Note in Nexora",
      "description": "Learn how to create a rich note or document in Nexora, add text and media, use AI and voice tools, organize the note, and export it as a PDF.",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Create a Note",
          "text": "Open Nexora and select Add Note. If workspaces are available, choose the workspace and optional subgroup where the new note should be stored, then open the editor."
        },
        {
          "@type": "HowToStep",
          "name": "Write and Format Content",
          "text": "Enter text in the rich editor and use headings, bold, italic, underline, lists, checklists, alignment, links, colors, highlights, tables, code blocks, and other formatting controls to structure the document."
        },
        {
          "@type": "HowToStep",
          "name": "Use Markdown and HTML Content",
          "text": "Add or work with Markdown, HTML, and regular text within the document workflow. Nexora supports rich content alongside Markdown and HTML-based content."
        },
        {
          "@type": "HowToStep",
          "name": "Add Media and Documents",
          "text": "Add images, videos, audio, PDFs, Word documents, Excel files, and other supported media using the attachment controls, drag and drop, paste, or supported URLs."
        },
        {
          "@type": "HowToStep",
          "name": "Record Audio or Video",
          "text": "Use Nexora's recording tools to capture audio from a microphone or video from a camera and insert the resulting recording into the note."
        },
        {
          "@type": "HowToStep",
          "name": "Extract Text with OCR",
          "text": "Add a supported image or scanned document and use the OCR functionality to extract its text. The extracted content can be processed into structured Markdown for use in the note."
        },
        {
          "@type": "HowToStep",
          "name": "Use Speech-to-Text",
          "text": "Open the voice input tool, select the desired language, and speak. Nexora transcribes the speech and inserts the resulting text into the editor or supported AI prompt field."
        },
        {
          "@type": "HowToStep",
          "name": "Use AI Writing Tools",
          "text": "Select text and open the AI actions to improve, correct, simplify, summarize, expand, shorten, change its tone, or provide a custom instruction. Nexora can apply the generated result to the document."
        },
        {
          "@type": "HowToStep",
          "name": "Generate Images, Charts, or Diagrams",
          "text": "Use the AI visual tools to generate an image or create a chart or diagram from instructions or selected content. Generated visual content can be inserted directly into the note."
        },
        {
          "@type": "HowToStep",
          "name": "Organize the Note",
          "text": "Assign the note to a workspace and optional subgroup, mark it as a favorite when needed, and use search, filtering, sorting, or drag-and-drop ordering to manage the note collection."
        },
        {
          "@type": "HowToStep",
          "name": "Review the Note",
          "text": "Open the note in read-only view mode to review its formatted content and embedded media without editing. Use the full-screen view for a distraction-free reading experience."
        },
        {
          "@type": "HowToStep",
          "name": "Use Text-to-Speech",
          "text": "Select text and use the text-to-speech tool to listen to it. Playback includes controls for pausing, seeking, and adjusting the reading speed."
        },
        {
          "@type": "HowToStep",
          "name": "Export the Document",
          "text": "When the note is complete, use the PDF export controls in view mode to generate a PDF with the available light or dark background option."
        }
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://nexora-notes-document-maker.web.app/#website",
      "url": "https://nexora-notes-document-maker.web.app/",
      "name": "Nexora",
      "description": "Nexora — Rich Notes & Document Maker"
    }
  ]
};

const head = buildHead({
  title: "Nexora — Rich Notes & Document Maker",

  description: "Nexora is an offline-first rich notes & document maker with text/Markdown/HTML, all-media support, AI writing, image generation, voice tools, OCR & workspaces.",

  canonical: "https://nexora-notes-document-maker.web.app/",

  type: "website",

  image: "https://nexora-notes-document-maker.web.app/notes.png",

  url: "https://nexora-notes-document-maker.web.app/",

  jsonLd: json_ld,
});

console.log("------Auto Generated Head: ", head.value);

useHead(head);
</script>
