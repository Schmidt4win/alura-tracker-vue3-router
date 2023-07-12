import ICliente from '../interfaces/ICliente';

export default class ClienteApi {
  async fetchClienteData(): Promise<ICliente[]> {
    try {
      const response = await fetch('http://localhost:3010/cadastroclientesget');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cliente data:', error);
      throw error;
    }
  }

  async deleteCliente(clienteId: string): Promise<void> {
    try {
      await fetch(`http://localhost:3010/cadastroclientesdelete/${clienteId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      throw error;
    }
  }

  async updateCliente(cliente: ICliente): Promise<void> {
    try {
      await fetch(`http://localhost:3010/cadastroclientesput/${cliente._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cliente),
      });
    } catch (error) {
      console.error('Erro ao editar cliente:', error);
      throw error;
    }
  }
}
