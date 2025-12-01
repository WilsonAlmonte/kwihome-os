export const mockHomeAreasRepository: HomeAreasRepository = {
  findAll: async function (): Promise<HomeArea[]> {
    return Promise.resolve([
      { id: "1", name: "Living Room" },
      { id: "2", name: "Kitchen" },
    ]);
  },
  findById: function (_id: string): Promise<HomeArea | null> {
    return Promise.resolve({ id: "1", name: "Living Room" });
  },
  create: function (name: string): Promise<HomeArea> {
    return Promise.resolve({ id: "3", name });
  },
  update: function (id: string, name: string): Promise<HomeArea> {
    return Promise.resolve({ id, name });
  },
  delete: function (id: string): Promise<void> {
    return Promise.resolve();
  },
  getStats: function (): Promise<{ total: number }> {
    return Promise.resolve({ total: 2 });
  },
};
