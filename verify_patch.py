import os

file_path = r"node_modules\react-native\ReactCommon\react\renderer\core\graphicsConversions.h"

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "std::format" in content:
        print("STATUS: FAILED (Found std::format)")
    else:
        print("STATUS: CLEAN (No std::format found)")

    if "folly::sformat" in content:
        print("STATUS: PATCHED (Found folly::sformat)")
    else:
        print("STATUS: WARNING (No folly::sformat found)")
        
    print("\n--- CONTENT PREVIEW ---")
    lines = content.splitlines()
    for i, line in enumerate(lines):
        if "format" in line:
            print(f"{i+1}: {line}")

except Exception as e:
    print(f"Error reading file: {e}")
