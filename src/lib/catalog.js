import getCatalog from "@/lib/request/get-catalog";

export async function getCollections(catalog) {
  const collections = catalog.links.filter((el) => el.rel === "child");

  return await Promise.all(
    collections.map(async (collection) => {
      const dataset = await getCatalog(collection.href);
      if (dataset.id === "template") return;
      return {
        ...dataset,
        ...("cube:variables" in dataset &&
        Object.keys(dataset["cube:variables"]).length !== 0
          ? {
              variables: Object.entries(dataset["cube:variables"])
                .filter(([, item]) => item.type === "data")
                .map(([id]) => id),
            }
          : {}),
        summaries: Object.entries(dataset?.summaries || catalog?.summaries).map(
          ([id, item]) => {
            return {
              id: id,
              description: (dataset?.["summary_descriptions"] ||
                catalog?.["summary_descriptions"])?.[id],
              allowedValues: item,
              chosenValue: item[0],
            };
          }
        ),
      };
    })
  );
}
