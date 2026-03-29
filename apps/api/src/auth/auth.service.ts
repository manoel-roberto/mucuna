import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });
    if (
      user &&
      user.senhaHash &&
      (await bcrypt.compare(pass, user.senhaHash))
    ) {
      const { senhaHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, roleId: user.roleId };
    const permissions =
      user.role?.permissions.map((p: any) => p.permission.slug) || [];

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        roleId: user.roleId,
        roleName: user.role?.nome,
        permissions: permissions,
      },
    };
  }

  async register(data: any) {
    const { name, email, cpf, password, editalId, numeroInscricao } = data;
    const cleanCpf = cpf.replace(/\D/g, '');

    // Se for candidato, validar se está na lista de habilitados do edital
    if (!editalId || !numeroInscricao) {
      throw new Error(
        'Edital e Número de Inscrição são obrigatórios para cadastro.',
      );
    }

    const classificacao = await this.prisma.classificacaoCandidato.findFirst({
      where: {
        editalId,
        cpfCandidato: cleanCpf,
        numeroInscricao: numeroInscricao,
      },
    });

    if (!classificacao) {
      throw new Error(
        'Candidato não encontrado ou dados (CPF/Inscrição) incorretos para este edital.',
      );
    }

    const existingUser = await this.prisma.usuario.findFirst({
      where: { OR: [{ email }, { cpf: cleanCpf }] },
    });

    if (existingUser) {
      throw new Error('Usuário com este e-mail ou CPF já cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const roleCandidato = await this.prisma.role.findUnique({
      where: { nome: 'Candidato' },
    });

    const user = await this.prisma.usuario.create({
      data: {
        nome: name,
        email,
        cpf: cleanCpf,
        senhaHash: hashedPassword,
        roleId: roleCandidato?.id,
      },
    });

    // Vincular o usuário recém-criado a TODAS as suas linhas de classificação pelo CPF
    await this.prisma.classificacaoCandidato.updateMany({
      where: { cpfCandidato: cleanCpf },
      data: { usuarioId: user.id },
    });

    const { senhaHash, ...result } = user;
    return {
      message: 'Cadastro realizado com sucesso.',
      user: result,
    };
  }
}
