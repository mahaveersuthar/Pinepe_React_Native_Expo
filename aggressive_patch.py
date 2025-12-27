import os
import sys

# Define path
file_path = os.path.abspath(r"node_modules\react-native\ReactCommon\react\renderer\core\graphicsConversions.h")
print(f"Targeting file: {file_path}")

try:
    if not os.path.exists(file_path):
        print("ERROR: File does not exist at specified path.")
        sys.exit(1)

    # Read content
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"File size before: {len(content)} bytes")
    
    # Check for target
    if "std::format" in content:
        print("FOUND: std::format. Proceeding to patch...")
        
        # Replace std::format with folly::sformat
        new_content = content.replace("std::format", "folly::sformat")
        
        # Ensure include is present
        if "#include <folly/Format.h>" not in new_content:
            print("ADDING: include <folly/Format.h>")
            new_content = new_content.replace("#include <folly/dynamic.h>", "#include <folly/dynamic.h>\n#include <folly/Format.h>")
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print("Patch written.")
        
        # Verify write
        with open(file_path, 'r', encoding='utf-8') as f:
            verify_content = f.read()
            
        if "folly::sformat" in verify_content and "std::format" not in verify_content:
             print("SUCCESS: File verified to contain folly::sformat and NO std::format.")
        else:
             print("FAILURE: File content did not match expected patch state!")
             if "std::format" in verify_content:
                 print(" - std::format still present.")
             if "folly::sformat" not in verify_content:
                 print(" - folly::sformat not found.")
                 
    elif "folly::sformat" in content:
        print("ALREADY PATCHED: folly::sformat found.")
    else:
        print("UNKNOWN STATE: Neither std::format nor folly::sformat found in potential locations.")
        # Print a snippet to help debug
        print("Snippet around line 80:")
        lines = content.splitlines()
        if len(lines) > 75:
            for i in range(75, min(85, len(lines))):
                 print(f"{i+1}: {lines[i]}")

except Exception as e:
    print(f"EXCEPTION: {e}")
    sys.exit(1)
