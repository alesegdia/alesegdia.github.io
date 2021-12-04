var find

window.addEventListener('DOMContentLoaded', (event) => {
	var tags = document.querySelectorAll("a[class^=filter-tag-name-");
	tags.forEach(element => {
		element.onclick = function() {
			element.classList.toggle("filter-selected");
			var selected = element.classList.contains("filter-selected");
			var tagname = null;
			for(let value of element.classList.values())
			{
				var match = value.match(/^filter-tag-name-(.*)$/);
				if(match != null)
				{
					tagname = match[1];
				}
			}
			var taggedElements = document.querySelectorAll(".filter-tagged-as-" + tagname);
			taggedElements.forEach(taggedelem => {
				if(selected)
				{
					taggedelem.classList.remove("filter-hidden");
					taggedelem.classList.add("filter-visible");
				}
				else
				{
					taggedelem.classList.add("filter-hidden");
					taggedelem.classList.remove("filter-visible");
				}
			});
		};
	});
});

