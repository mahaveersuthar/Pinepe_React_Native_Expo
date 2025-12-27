import os

file_path = r"C:\Users\Mohit Khandelwal\OneDrive\Desktop\pinepe\project\node_modules\react-native\ReactCommon\react\renderer\core\graphicsConversions.h"

print(f"Target: {file_path}")

try:
    if not os.path.exists(file_path):
        print("File not found!")
        exit(1)

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False
    if "std::format" in content:
        print("Found std::format. Replacing with folly::sformat...")
        content = content.replace("std::format", "folly::sformat")
        modified = True
    
    if "#include <folly/Format.h>" not in content:
        print("Adding folly/Format.h include...")
        content = content.replace("#include <folly/dynamic.h>", "#include <folly/dynamic.h>\n#include <folly/Format.h>")
        modified = True
        
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("File patched successfully.")
    else:
        print("No changes needed (already patched or patterns not found).")
        
    # Verify
    with open(file_path, 'r', encoding='utf-8') as f:
        verify_content = f.read()
        if "std::format" in verify_content:
            print("VERIFICATION FAILED: std::format still present.")
        elif "folly::sformat" in verify_content:
            print("VERIFICATION SUCCESS: folly::sformat confirmed.")
        else:
             print("VERIFICATION WEIRD: Neither std::format nor folly::sformat found.")

except Exception as e:
    print(f"EXCEPTION: {e}")
