window.addEventListener('DOMContentLoaded', (event) => {







	var classes = [];

    function filterDivs(className) {
    	var idx = classes.indexOf(className);
    	if(idx != -1)
    	{
    		classes.splice(idx, 1);
    	}
    	else
    	{
    		classes.push(className);
    	}
    	refresh();
    }

    function refresh() {
        const divs = document.querySelectorAll('.game-entry');
        if (classes.length == 0) {
            divs.forEach(div => {
                div.style.display = 'block';
            });
        } else {
        	classes.forEach(name => {
        		divs.forEach(div => {
	                if (div.classList.contains(name)) {
	                    div.style.display = div.style.display === 'block' || div.style.display === '' ? 'none' : 'block';
	                }
	        	});
        	});
        }
    }

    filterDivs();

    document.querySelectorAll('.filter-tag').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const filterClass = this.getAttribute('data-filter');
            filterDivs(filterClass);
            var selected = this.classList.contains("filter-active");

            // Toggle active/inactive class for filter links
            document.querySelectorAll('.filter-tag').forEach(filterLink => {
                if (filterLink === link) {
                    filterLink.classList.add('filter-active');
                } else {
                    filterLink.classList.remove('filter-active');
                }
            });
        });
    });








});

