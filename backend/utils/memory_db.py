"""
In-Memory Database Fallback
Used when MongoDB is not available. Provides a dict-based mock collection interface.
"""


class InMemoryCollection:
    """Mock MongoDB collection using in-memory lists."""

    def __init__(self, name=""):
        self.name = name
        self._docs = []
        self._id_counter = 0

    def insert_one(self, doc):
        self._id_counter += 1
        doc["_id"] = str(self._id_counter)

        class Result:
            def __init__(self, id_val):
                self.inserted_id = id_val

        self._docs.append(doc.copy())
        return Result(doc["_id"])

    def insert_many(self, docs):
        for doc in docs:
            self.insert_one(doc)

    def find_one(self, query=None):
        if not query:
            return self._docs[0] if self._docs else None
        for doc in self._docs:
            if self._match(doc, query):
                return doc.copy()
        return None

    def find(self, query=None, projection=None):
        results = []
        for doc in self._docs:
            if query is None or self._match(doc, query):
                d = doc.copy()
                if projection:
                    for key in list(d.keys()):
                        if key != "_id" and key in projection and projection[key] == 0:
                            del d[key]
                results.append(d)
        return InMemoryCursor(results)

    def count_documents(self, query=None):
        if not query:
            return len(self._docs)
        return sum(1 for d in self._docs if self._match(d, query))

    def aggregate(self, pipeline):
        # Simplified aggregation support
        docs = list(self._docs)
        for stage in pipeline:
            if "$match" in stage:
                docs = [d for d in docs if self._match(d, stage["$match"])]
            elif "$group" in stage:
                docs = self._group(docs, stage["$group"])
            elif "$sort" in stage:
                key = list(stage["$sort"].keys())[0]
                reverse = list(stage["$sort"].values())[0] == -1
                docs.sort(key=lambda d: str(self._get_nested(d, key) or ""), reverse=reverse)
        return docs

    def _group(self, docs, group_spec):
        groups = {}
        id_spec = group_spec["_id"]
        for doc in docs:
            if isinstance(id_spec, dict):
                key = tuple(doc.get(v.replace("$", ""), "") for v in id_spec.values())
                key_dict = {k: doc.get(v.replace("$", ""), "") for k, v in id_spec.items()}
            else:
                key = doc.get(id_spec.replace("$", ""), "")
                key_dict = key
            if key not in groups:
                groups[key] = {"_id": key_dict, "_docs": []}
            groups[key]["_docs"].append(doc)

        results = []
        for key, grp in groups.items():
            result = {"_id": grp["_id"]}
            for field, op in group_spec.items():
                if field == "_id":
                    continue
                if isinstance(op, dict):
                    if "$avg" in op:
                        src = op["$avg"].replace("$", "")
                        vals = [d.get(src, 0) for d in grp["_docs"]]
                        result[field] = sum(vals) / max(len(vals), 1)
                    elif "$sum" in op:
                        if op["$sum"] == 1:
                            result[field] = len(grp["_docs"])
                        else:
                            src = op["$sum"].replace("$", "")
                            result[field] = sum(d.get(src, 0) for d in grp["_docs"])
                    elif "$min" in op:
                        src = op["$min"].replace("$", "")
                        vals = [d.get(src, 0) for d in grp["_docs"]]
                        result[field] = min(vals) if vals else 0
                    elif "$max" in op:
                        src = op["$max"].replace("$", "")
                        vals = [d.get(src, 0) for d in grp["_docs"]]
                        result[field] = max(vals) if vals else 0
            results.append(result)
        return results

    def _match(self, doc, query):
        for key, val in query.items():
            if doc.get(key) != val:
                return False
        return True

    def _get_nested(self, doc, key):
        parts = key.split(".")
        obj = doc
        for p in parts:
            if isinstance(obj, dict):
                obj = obj.get(p)
            else:
                return None
        return obj


class InMemoryCursor:
    """Mock cursor for in-memory find results."""

    def __init__(self, docs):
        self._docs = docs

    def sort(self, key, direction=-1):
        self._docs.sort(key=lambda d: d.get(key, ""), reverse=(direction == -1))
        return self

    def limit(self, n):
        self._docs = self._docs[:n]
        return self

    def __iter__(self):
        return iter(self._docs)

    def __list__(self):
        return list(self._docs)


class InMemoryDB:
    """Mock MongoDB database using in-memory collections."""

    def __init__(self):
        self._collections = {}

    def __getattr__(self, name):
        if name.startswith("_"):
            return super().__getattribute__(name)
        if name not in self._collections:
            self._collections[name] = InMemoryCollection(name)
        return self._collections[name]


def get_database(mongo_uri, db_name, timeout=3000):
    """
    Try to connect to MongoDB. If it fails, return an in-memory fallback.
    Returns (db, is_memory).
    """
    try:
        from pymongo import MongoClient
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=timeout)
        # Force a connection test
        client.admin.command("ping")
        print(f"[OK] Connected to MongoDB at {mongo_uri}")
        return client[db_name], False
    except Exception as e:
        print(f"[INFO] MongoDB not available, using in-memory storage: {e}")
        return InMemoryDB(), True
