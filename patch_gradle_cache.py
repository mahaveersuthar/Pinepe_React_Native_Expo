import os
import sys

# Define path to the CACHED file
file_path = r"C:\Users\Mohit Khandelwal\.gradle\caches\8.14.3\transforms\8bca444e06763d64457172ec6b80f8aa\transformed\react-android-0.81.5-debug\prefab\modules\reactnative\include\react\renderer\core\graphicsConversions.h"
print(f"Targeting CACHED file: {file_path}")

try:
    if not os.path.exists(file_path):
        print("ERROR: Cached file does not exist at specified path.")
        sys.exit(1)

    # Read content
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"File size before: {len(content)} bytes")
    
    modified = False
    
    # Check for target
    if "std::format" in content:
        print("FOUND: std::format. Proceeding to patch...")
        
        # Replace std::format with folly::sformat
        content = content.replace("std::format", "folly::sformat")
        modified = True
    
    # Ensure include is present
    if "#include <folly/Format.h>" not in content:
        print("ADDING: include <folly/Format.h>")
        content = content.replace("#include <folly/dynamic.h>", "#include <folly/dynamic.h>\n#include <folly/Format.h>")
        modified = True
        
    if modified:
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Patch successfully written to cache.")
    else:
        print("File already patched or no changes needed.")

    # Verification
    with open(file_path, 'r', encoding='utf-8') as f:
            verify_content = f.read()
    
    if "folly::sformat" in verify_content and "std::format" not in verify_content:
         print("VERIFIED: Cache file matches patched state.")
    else:
         print("WARNING: Verification failed.")

except Exception as e:
    print(f"EXCEPTION: {e}")
    sys.exit(1)
