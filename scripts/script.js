Hooks.once('init', async function() {
  console.log('drageverything | Initializing drageverything module');

  // Register settings for saving positions
  game.settings.register('drageverything', 'playerListPosition', {
    name: 'Player List Position',
    scope: 'client',
    config: false,
    type: Object,
    default: {},
  });

  game.settings.register('drageverything', 'hotbarPosition', {
    name: 'Hotbar Position',
    scope: 'client',
    config: false,
    type: Object,
    default: {},
  });
});

Hooks.once('ready', function() {
  console.log('drageverything | Ready Hook');
  
  function makeDraggable(elementId, settingName, handleClass) {
    const element = document.getElementById(elementId);
    if (element) {
      const handle = element.querySelector(handleClass);
      if (!handle.querySelector('.drag-icon')) {
        const dragIcon = document.createElement('i');
        dragIcon.className = 'fas fa-arrows-alt drag-icon';
        handle.appendChild(dragIcon);

        // Prevent click events on the drag icon
        dragIcon.addEventListener('click', (event) => {
          event.stopPropagation();
        });

        // Load and apply saved position
        const savedPosition = game.settings.get('drageverything', settingName);
        if (savedPosition && savedPosition.top !== undefined && savedPosition.left !== undefined) {
          element.style.top = `${savedPosition.top}px`;
          element.style.left = `${savedPosition.left}px`;
          element.style.position = 'absolute';
        } else {
          // Set default position if no position is saved
          element.style.top = '50%';
          element.style.left = '50%';
          element.style.transform = 'translate(-50%, -50%)';
          element.style.position = 'absolute';
        }

        // Make the element draggable using the drag icon
        $(element).draggable({
          handle: '.drag-icon',
          containment: 'window',
          stop: (event, ui) => {
            const position = ui.helper.position();
            // Save the new position
            game.settings.set('drageverything', settingName, {
              top: position.top,
              left: position.left,
            });
            element.style.transform = ''; // Reset transform to avoid conflicts with stored positions
          },
        });

        console.log(`Draggable icon added and draggable functionality applied to ${elementId}`);
      }
    }
  }

  function makePlayersListDraggable() {
    makeDraggable('players', 'playerListPosition', 'h3');
  }

  function makeHotbarDraggable() {
    makeDraggable('hotbar', 'hotbarPosition', '#hotbar-lock');
  }

  // Check if jQuery UI is loaded
  if (typeof $.ui === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js';
    script.onload = () => {
      makePlayersListDraggable();
      makeHotbarDraggable();
    };
    document.head.appendChild(script);
  } else {
    makePlayersListDraggable();
    makeHotbarDraggable();
  }

  // Hook into renderPlayerList and renderHotbar to ensure the icons are added after each render
  Hooks.on('renderPlayerList', (app, html, data) => {
    makePlayersListDraggable();
  });

  Hooks.on('renderHotbar', (app, html, data) => {
    makeHotbarDraggable();
  });
});
