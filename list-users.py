import sys, json

data = json.load(sys.stdin)
for u in data.get("users", []):
    print(f"{u['email']}: {u['id']}")
