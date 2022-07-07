import { Request, Response } from 'express';
import { PatientReturn } from "./handlers/types";
import connect from "../db/connect";

exports.findAll = async (req: Request, res: Response) => {
    const conn = await connect();
    conn.query("SELECT * FROM Paciente", (err, patients) => {
        if (err) {
            return res.json({success: false, error: err});
        }
        return res.json({success: true, data: patients});
    });
    conn.end();
};

// Consulta envolvendo apenas as operações de seleção e projeção
exports.findById = async (req: Request, res: Response) => {
    const conn = await connect();
    conn.query("SELECT * FROM Paciente WHERE paciente_id = ?", [req.params.id], (err, patient: any[]) => {
        if (err) {
            return res.json({success: false, error: err});
        }
        if (patient.length) {
            return res.json({success: true, data: patient});
        }
        return res.json({success: false, error: "Paciente nao encontrado!"});
    });
    conn.end();
};

// Consulta envolvendo a junção de apenas duas relações (OUTER JOIN)
exports.findPatientsCategories = async (req: Request, res: Response) => {
    const selection = "paciente_id, nome";
    const on = "Paciente.fk_categoria_id = Categoria.categoria_id";
    const conn = await connect();
    conn.query(`SELECT ${selection} FROM Paciente LEFT OUTER JOIN Categoria ON ${on};`, (err, patients) => {
        if (err) {
            return res.json({success: false, error: err});
        }
        return res.json({success: true, data: patients});
    });
    conn.end();
};

// Consulta envolvendo a junção de três relações
exports.findPatientDoses = async (req: Request, res: Response) => {
    const selection = "paciente_id, data_aplicacao, Dose.fk_vacina_id, dose_id, descricao_dose, num_dose, data_nasc";
    const first_condition = `Paciente_Vacinado.fk_vacina_id=Dose.fk_vacina_id and fk_paciente_id="${req.params.id}"`;
    const second_condition = `paciente_id="${req.params.id}" and fk_paciente_id="${req.params.id}"`;
    const conn = await connect();
    conn.query(`SELECT ${selection} FROM Paciente_Vacinado INNER JOIN Dose ON ${first_condition} INNER JOIN Paciente ON ${second_condition};`, (err: Error, patient: any[]) => {
        if (err) {
            return res.json({success: false, error: err});
        }
        if (patient.length) {
            return res.json({success: true, data: patient});
        }
        return res.json({success: false, error: "Paciente nao encontrado!"});
    });
    conn.end();
};

// Consulta envolvendo funções de agregação (COUNT, GROUP BY)
exports.countPatientsByRegion = async (req: Request, res: Response) => {
    const conn = await connect();
    conn.query("SELECT endereco_uf, COUNT(*) AS Quantidade from Paciente GROUP BY endereco_uf ORDER BY Quantidade DESC;", (err, data) => {
        if (err) {
            return res.json({success: false, error: err});
        }
        return res.json({success: true, data: data});
    });
    conn.end();
};

exports.create = async (req: Request, res: Response) => {
    const newPatient: PatientReturn = {
        paciente_id: req.body.paciente_id,
        data_nasc: req.body.data_nasc,
        idade: req.body.idade,
        endereco_cep: req.body.endereco_cep,
        endereco_uf: req.body.endereco_uf,
        fk_categoria_id: req.body.fk_categoria_id
    };

    const conn = await connect();
    conn.query("INSERT INTO Paciente SET ?", [newPatient], (err) => {
        if (err) {
            return res.json({success: false, error: err});
        }
        return res.json({success: true, data: newPatient});
      });
    conn.end();
};

exports.update = async (req: Request, res: Response) => {
    const updatedPatient: Partial<PatientReturn> = {};
    if ('paciente_id' in req.body) {
        updatedPatient.paciente_id = req.body.paciente_id;
    }
    if ('data_nasc' in req.body) {
        updatedPatient.data_nasc = req.body.data_nasc;
    }
    if ('idade' in req.body) {
        updatedPatient.idade = req.body.idade;
    }
    if ('endereco_cep' in req.body) {
        updatedPatient.endereco_cep = req.body.endereco_cep;
    }
    if ('endereco_uf' in req.body) {
        updatedPatient.endereco_uf = req.body.endereco_uf;
    }
    if ('fk_categoria_id' in req.body) {
        updatedPatient.fk_categoria_id = req.body.fk_categoria_id;
    }

    const conn = await connect();
    conn.query("UPDATE Paciente SET ? WHERE paciente_id = ?", [updatedPatient, req.params.id], (err) => {
        if (err) {
            return res.json({success: false, error: err});
        }
        return res.json({success: true});
    });
    conn.end();
};

exports.delete = async (req: Request, res: Response) => {
    const conn = await connect();
    conn.query("DELETE FROM Paciente WHERE paciente_id = ?", [req.params.id], (err) => {
        if (err) {
            return res.json({success: false, error: err});
        }
        return res.json({success: true});
    });
    conn.end();
};