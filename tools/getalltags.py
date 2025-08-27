import os
import re

def get_tags_from_md(file_path):
    tags = set()
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        # Look for YAML front matter tags: tags: [tag1, tag2]
        match = re.search(r'tags:\s*\[([^\]]*)\]', content)
        if match:
            tag_list = match.group(1)
            tags.update(tag.strip() for tag in tag_list.split(',') if tag.strip())
        else:
            # Alternative: tags: tag1, tag2
            match = re.search(r'tags:\s*([^\n]+)', content)
            if match:
                tag_list = match.group(1)
                tags.update(tag.strip() for tag in tag_list.split(',') if tag.strip())
    return tags

def main():
    games_dir = os.path.join(os.path.dirname(__file__), '..', '_games')
    all_tags = set()
    for filename in os.listdir(games_dir):
        if filename.endswith('.md'):
            file_path = os.path.join(games_dir, filename)
            tags = get_tags_from_md(file_path)
            all_tags.update(tags)
    print("Tags found in _games/:")
    for tag in sorted(all_tags):
        print(tag)

if __name__ == "__main__":
    main()