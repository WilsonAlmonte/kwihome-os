import { HomeArea } from "@repo/features/home-areas/home-area.entity";
import { HomeAreasRepository } from "@repo/features/home-areas/home-areas.port";

let homeAreas: HomeArea[] = [
  { id: "1", name: "Living Room" },
  { id: "2", name: "Kitchen" },
  { id: "3", name: "Garage" },
  { id: "4", name: "Bedroom" },
  { id: "5", name: "Bathroom" },
];

export const mockHomeAreasRepository: HomeAreasRepository = {
  findAll: async function (): Promise<HomeArea[]> {
    return Promise.resolve(homeAreas);
  },
  findById: function (id: string): Promise<HomeArea | null> {
    const area = homeAreas.find((area) => area.id === id) || null;
    return Promise.resolve(area);
  },
  create: function (name: string): Promise<HomeArea> {
    const id = (parseInt(homeAreas[homeAreas.length - 1].id) + 1).toString();
    const newArea = {
      id,
      name,
    };
    homeAreas.push(newArea);
    return Promise.resolve(newArea);
  },
  update: function (id: string, name: string): Promise<HomeArea> {
    const areaIndex = homeAreas.findIndex((area) => area.id === id);
    if (areaIndex !== -1) {
      homeAreas[areaIndex].name = name;
    }
    return Promise.resolve({ id, name });
  },
  delete: function (id: string): Promise<void> {
    homeAreas = homeAreas.filter((area) => area.id !== id);
    return Promise.resolve();
  },
  getStats: function (): Promise<{ total: number }> {
    return Promise.resolve({ total: homeAreas.length });
  },
};
