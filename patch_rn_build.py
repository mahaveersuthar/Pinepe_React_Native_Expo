import os

file_path = r"node_modules\react-native\ReactCommon\react\renderer\core\graphicsConversions.h"

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if we need to patch
    if "std::format" in content:
        print("Found std::format, patching...")
        new_content = content.replace("std::format", "folly::sformat")
        
        # Ensure folly/Format.h is included if not already (simple check)
        if "#include <folly/Format.h>" not in new_content:
             # Add it after other includes
             new_content = new_content.replace("#include <folly/dynamic.h>", "#include <folly/dynamic.h>\n#include <folly/Format.h>")

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully patched graphicsConversions.h")
    else:
        print("std::format not found (already patched?)")

except Exception as e:
    print(f"Error patching file: {e}")
