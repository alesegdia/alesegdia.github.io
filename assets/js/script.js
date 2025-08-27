window.addEventListener('DOMContentLoaded', (event) => {
	console.log('DOM loaded, setting up tag filters...');
	
	// Get all tag elements 
	var tags = document.querySelectorAll('[class*="filter-tag-name-"]');
	console.log('Found tag elements:', tags.length);
	
	// Get all type filter elements
	var typeFilters = document.querySelectorAll('.type-filter');
	console.log('Found type filter elements:', typeFilters.length);
	
	if (tags.length === 0) {
		console.log('No tag elements found! Checking available elements...');
		var allAs = document.querySelectorAll('a');
		console.log('All <a> elements:', allAs.length);
		allAs.forEach(a => console.log('Link class:', a.className));
	}
	
	// Function to update selected tags display
	function updateSelectedTagsDisplay() {
		var selectedTagsContainer = document.getElementById('selected-tags-container');
		var selectedTagsList = document.getElementById('selected-tags-list');
		var selectedTags = [];
		var selectedTagElements = [];
		var selectedTypes = [];
		var selectedTypeElements = [];
		
		// Get all selected tags and hide them from main area
		var allTagElements = document.querySelectorAll('[class*="filter-tag-name-"]');
		allTagElements.forEach(tagElement => {
			if (tagElement.classList.contains("filter-selected")) {
				var tagName = tagElement.textContent.trim();
				selectedTags.push(tagName);
				selectedTagElements.push(tagElement);
				// Hide from main tag area
				tagElement.style.display = 'none';
			} else {
				// Show in main tag area if not selected
				tagElement.style.display = 'inline-block';
			}
		});
		
		// Get all selected type filters
		var allTypeElements = document.querySelectorAll('.type-filter');
		allTypeElements.forEach(typeElement => {
			if (typeElement.classList.contains("filter-selected")) {
				var typeName = typeElement.textContent.trim();
				selectedTypes.push(typeName);
				selectedTypeElements.push(typeElement);
			}
		});
		
		var totalSelected = selectedTags.length + selectedTypes.length;
		var totalSelected = selectedTags.length + selectedTypes.length;
		
		if (totalSelected > 0) {
			selectedTagsContainer.style.display = 'block';
			
			// Create clickable tags and types in selected area with original styling
			selectedTagsList.innerHTML = '';
			
			// Add selected tags
			selectedTags.forEach((tagName, index) => {
				var originalElement = selectedTagElements[index];
				var tagSpan = document.createElement('span');
				tagSpan.textContent = tagName;
				
				// Copy the original styling classes
				var sizeClass = '';
				if (originalElement.classList.contains('tag-size-low')) sizeClass = 'tag-size-low';
				else if (originalElement.classList.contains('tag-size-mid')) sizeClass = 'tag-size-mid';
				else if (originalElement.classList.contains('tag-size-high')) sizeClass = 'tag-size-high';
				
				tagSpan.className = sizeClass;
				tagSpan.style.cssText = `
					display: inline-block;
					cursor: pointer;
					margin: 0.2rem;
					border: 2px solid #0056b3;
					transition: all 0.2s ease;
					position: relative;
				`;
				
				// Add a subtle overlay to indicate it's selected
				tagSpan.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.3)';
				
				tagSpan.title = 'Click to remove this filter';
				
				// Add hover effect
				tagSpan.addEventListener('mouseenter', function() {
					tagSpan.style.opacity = '0.7';
					tagSpan.style.transform = 'scale(0.95)';
				});
				tagSpan.addEventListener('mouseleave', function() {
					tagSpan.style.opacity = '1';
					tagSpan.style.transform = 'scale(1)';
				});
				
				// Add click handler to remove the tag
				tagSpan.addEventListener('click', function() {
					selectedTagElements[index].classList.remove('filter-selected');
					filterGames();
					updateSelectedTagsDisplay();
				});
				
				selectedTagsList.appendChild(tagSpan);
			});
			
			// Add selected types
			selectedTypes.forEach((typeName, index) => {
				var originalElement = selectedTypeElements[index];
				var typeSpan = document.createElement('span');
				typeSpan.textContent = typeName;
				
				// Copy color classes from original
				var colorClass = '';
				if (originalElement.classList.contains('tag-orange')) colorClass = 'tag-orange';
				else if (originalElement.classList.contains('tag-blue')) colorClass = 'tag-blue';
				else if (originalElement.classList.contains('tag-green')) colorClass = 'tag-green';
				else if (originalElement.classList.contains('tag-gray')) colorClass = 'tag-gray';
				
				typeSpan.className = colorClass;
				typeSpan.style.cssText = `
					display: inline-block;
					cursor: pointer;
					margin: 0.2rem;
					padding: 0.3rem 0.6rem;
					border-radius: 6px;
					font-size: 0.8rem;
					font-weight: 600;
					transition: all 0.2s ease;
					border: 2px solid #333;
				`;
				
				typeSpan.title = 'Click to remove this type filter';
				
				// Add hover effect
				typeSpan.addEventListener('mouseenter', function() {
					typeSpan.style.opacity = '0.7';
					typeSpan.style.transform = 'scale(0.95)';
				});
				typeSpan.addEventListener('mouseleave', function() {
					typeSpan.style.opacity = '1';
					typeSpan.style.transform = 'scale(1)';
				});
				
				// Add click handler to remove the type filter
				typeSpan.addEventListener('click', function() {
					selectedTypeElements[index].classList.remove('filter-selected');
					filterGames();
					updateSelectedTagsDisplay();
				});
				
				selectedTagsList.appendChild(typeSpan);
			});
		} else {
			selectedTagsContainer.style.display = 'none';
		}
	}
	
	// Function to filter games based on selected tags and types
	function filterGames() {
		// Get all selected tags
		var selectedTags = [];
		var allTagElements = document.querySelectorAll('[class*="filter-tag-name-"]');
		
		allTagElements.forEach(tagElement => {
			if (tagElement.classList.contains("filter-selected")) {
				// Extract tag name from class
				for(let value of tagElement.classList.values()) {
					var match = value.match(/^filter-tag-name-(.*)$/);
					if(match != null) {
						selectedTags.push(match[1]);
					}
				}
			}
		});
		
		// Get all selected types
		var selectedTypes = [];
		var allTypeElements = document.querySelectorAll('.type-filter');
		
		allTypeElements.forEach(typeElement => {
			if (typeElement.classList.contains("filter-selected")) {
				// Extract type name from class
				for(let value of typeElement.classList.values()) {
					var match = value.match(/^filter-type-(.*)$/);
					if(match != null) {
						selectedTypes.push(match[1]);
					}
				}
			}
		});
		
		console.log('Selected tags:', selectedTags);
		console.log('Selected types:', selectedTypes);
		
		// Show/hide games based on selected tags and types
		var allGameElements = document.querySelectorAll(".game-card");
		console.log('Found game elements:', allGameElements.length);
		
		allGameElements.forEach(gameElement => {
			if (selectedTags.length === 0 && selectedTypes.length === 0) {
				// If no filters selected, show all games
				gameElement.classList.remove("filter-hidden");
				gameElement.classList.add("filter-visible");
			} else {
				var hasSelectedTag = true;
				var hasSelectedType = true;
				
				// Check tag filtering
				if (selectedTags.length > 0) {
					hasSelectedTag = selectedTags.some(tag => 
						gameElement.classList.contains("filter-tagged-as-" + tag)
					);
				}
				
				// Check type filtering
				if (selectedTypes.length > 0) {
					hasSelectedType = selectedTypes.some(type => 
						gameElement.classList.contains("filter-type-" + type)
					);
				}
				
				// Show game only if it matches both tag and type filters (AND logic)
				if (hasSelectedTag && hasSelectedType) {
					gameElement.classList.remove("filter-hidden");
					gameElement.classList.add("filter-visible");
				} else {
					gameElement.classList.add("filter-hidden");
					gameElement.classList.remove("filter-visible");
				}
			}
		});
	}
	
	// Function to clear all filters
	function clearAllFilters() {
		var allTagElements = document.querySelectorAll('[class*="filter-tag-name-"]');
		allTagElements.forEach(tagElement => {
			tagElement.classList.remove('filter-selected');
		});
		
		var allTypeElements = document.querySelectorAll('.type-filter');
		allTypeElements.forEach(typeElement => {
			typeElement.classList.remove('filter-selected');
		});
		
		filterGames();
		updateSelectedTagsDisplay();
	}
	
	// Set up clear button
	var clearButton = document.getElementById('clear-filters');
	if (clearButton) {
		clearButton.addEventListener('click', clearAllFilters);
	}
	
	tags.forEach(element => {
		console.log('Setting up click handler for:', element.className, element.textContent);
		element.style.cursor = 'pointer';
		
		element.addEventListener('click', function(e) {
			e.preventDefault();
			console.log('Tag clicked:', element.className, element.textContent);
			
			element.classList.toggle("filter-selected");
			console.log('Classes after toggle:', element.className);
			
			// Filter games and update display
			filterGames();
			updateSelectedTagsDisplay();
		});
	});
	
	// Set up type filter click handlers
	typeFilters.forEach(element => {
		console.log('Setting up type filter click handler for:', element.className, element.textContent);
		element.style.cursor = 'pointer';
		
		element.addEventListener('click', function(e) {
			e.preventDefault();
			console.log('Type filter clicked:', element.className, element.textContent);
			
			element.classList.toggle("filter-selected");
			console.log('Classes after toggle:', element.className);
			
			// Filter games and update display
			filterGames();
			updateSelectedTagsDisplay();
		});
	});
});

