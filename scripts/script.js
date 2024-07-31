Hooks.once('init', async function() {
  console.log('DragEverything | Initializing DragEverything module');

  // Register settings for saving positions
  game.settings.register('DragEverything', 'playerListPosition', {
    name: 'Player List Position',
    scope: 'client',
    config: false,
    type: Object,
    default: {},
  });

  game.settings.register('DragEverything', 'hotbarPosition', {
    name: 'Hotbar Position',
    scope: 'client',
    config: false,
    type: Object,
    default: {},
  });

  game.settings.register('DragEverything', 'sidebarPosition', {
    name: 'Sidebar Position',
    scope: 'client',
    config: false,
    type: Object,
    default: {},
  });

  game.settings.register('DragEverything', 'sidebarHeight', {
    name: 'Sidebar Height',
    scope: 'client',
    config: false,
    type: Number,
    default: window.innerHeight,  // Default to full height
  });
});

Hooks.once('ready', function() {
  console.log('DragEverything | Ready Hook');

  function makeElementDraggable(elementId, settingName, handleSelector) {
    const element = document.getElementById(elementId);
    if (element) {
      const handle = document.querySelector(handleSelector);
      if (!handle.previousElementSibling || !handle.previousElementSibling.classList.contains('drag-icon')) {
        const dragIcon = document.createElement('i');
        dragIcon.className = 'fas fa-arrows-alt drag-icon ui-draggable-handle';
        handle.parentNode.insertBefore(dragIcon, handle);

        // Prevent click events on the drag icon
        dragIcon.addEventListener('click', (event) => {
          event.stopPropagation();
        });

        // Load and apply saved position and height
        const savedPosition = game.settings.get('DragEverything', settingName);
        const savedHeight = game.settings.get('DragEverything', 'sidebarHeight');
        if (savedPosition && savedPosition.top !== undefined && savedPosition.left !== undefined) {
          element.style.top = `${Math.max(savedPosition.top, 0)}px`;
          element.style.left = `${savedPosition.left}px`;
          element.style.height = `${savedHeight}px`;
          element.style.position = 'absolute';
        } else {
          // Set default position and height if no position is saved
          element.style.top = '0px';
          element.style.left = '0px';
          element.style.height = '100%';
          element.style.position = 'absolute';
        }

        // Make the element draggable using the drag icon
        $(element).draggable({
          handle: '.drag-icon',
          containment: 'window',
          stop: (event, ui) => {
            let position = ui.helper.position();
            // Ensure the top is never less than 0
            position.top = Math.max(position.top, 0);
            element.style.top = `${position.top}px`;

            // Save the new position
            game.settings.set('DragEverything', settingName, {
              top: position.top,
              left: position.left,
            });
            element.style.transform = ''; // Reset transform to avoid conflicts with stored positions
          },
        });

        // Add the resizable handle after the chat form
        const chatForm = document.getElementById('chat-form');
        if (chatForm) {
          const resizeHandle = document.createElement('div');
          resizeHandle.className = 'custom-resize-handle';
          resizeHandle.style.background = 'red';
          resizeHandle.style.width = '100%';
          resizeHandle.style.height = '6px';
          resizeHandle.style.cursor = 'pointer';
          resizeHandle.style.position = 'absolute';
          resizeHandle.style.bottom = '0px';
          resizeHandle.style.left = '0px';

          chatForm.parentNode.insertBefore(resizeHandle, chatForm.nextSibling);

          // Make the element resizable with the custom resize handle
          $(element).resizable({
            handles: {
              'se': resizeHandle,
            },
            containment: 'parent',
            stop: (event, ui) => {
              const newHeight = ui.size.height;
              // Save the new height
              game.settings.set('DragEverything', 'sidebarHeight', newHeight);
            }
          });
        }

        console.log(`Draggable and resizable functionality applied to ${elementId}`);
      }
    }
  }

  function makePlayersListDraggable() {
    const elementId = 'players';
    const settingName = 'playerListPosition';
    const element = document.getElementById(elementId);
    if (element) {
      const handle = element.querySelector('h3');
      if (!handle.querySelector('.drag-icon')) {
        const dragIcon = document.createElement('i');
        dragIcon.className = 'fas fa-arrows-alt drag-icon';
        handle.appendChild(dragIcon);

        const savedPosition = game.settings.get('DragEverything', settingName);
        if (savedPosition && savedPosition.top !== undefined && savedPosition.left !== undefined) {
          element.style.top = `${savedPosition.top}px`;
          element.style.left = `${savedPosition.left}px`;
          element.style.position = 'absolute';
        }

        $(element).draggable({
          handle: '.drag-icon',
          containment: 'window',
          stop: (event, ui) => {
            const position = ui.helper.position();
            game.settings.set('DragEverything', settingName, {
              top: position.top,
              left: position.left,
            });
            element.style.transform = '';
          },
        });

        console.log(`Draggable icon added and draggable functionality applied to ${elementId}`);
      }
    }
  }

  function makeHotbarDraggable() {
    const elementId = 'hotbar';
    const settingName = 'hotbarPosition';
    const element = document.getElementById(elementId);
    if (element) {
      const handle = element.querySelector('#hotbar-lock');
      if (!handle.querySelector('.drag-icon')) {
        const dragIcon = document.createElement('i');
        dragIcon.className = 'fas fa-arrows-alt drag-icon';
        handle.appendChild(dragIcon);

        const savedPosition = game.settings.get('DragEverything', settingName);
        if (savedPosition && savedPosition.top !== undefined && savedPosition.left !== undefined) {
          element.style.top = `${savedPosition.top}px`;
          element.style.left = `${savedPosition.left}px`;
          element.style.position = 'absolute';
        }

        $(element).draggable({
          handle: '.drag-icon',
          containment: 'window',
          stop: (event, ui) => {
            const position = ui.helper.position();
            game.settings.set('DragEverything', settingName, {
              top: position.top,
              left: position.left,
            });
            element.style.transform = '';
          },
        });

        console.log(`Draggable icon added and draggable functionality applied to ${elementId}`);
      }
    }
  }

  function makeSidebarDraggable() {
    // Use the settings tab as the point before which to insert the drag icon
    makeElementDraggable('ui-right', 'sidebarPosition', 'a.item[data-tab="settings"]');
  }

  // Check if jQuery UI is loaded
  if (typeof $.ui === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js';
    script.onload = () => {
      makePlayersListDraggable();
      makeHotbarDraggable();
      makeSidebarDraggable();
    };
    document.head.appendChild(script);
  } else {
    makePlayersListDraggable();
    makeHotbarDraggable();
    makeSidebarDraggable();
  }

  // Hook into render events to ensure the icons are added after each render
  Hooks.on('renderPlayerList', (app, html, data) => {
    makePlayersListDraggable();
  });

  Hooks.on('renderHotbar', (app, html, data) => {
    makeHotbarDraggable();
  });

  Hooks.on('renderSidebarTab', (app, html, data) => {
    makeSidebarDraggable();
  });
});
