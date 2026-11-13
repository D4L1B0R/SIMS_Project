import { prisma } from '@/prisma/prismaclient';
import { GenericRepository } from './GenericRepository';
import { Bookmark } from '../models/Bookmark';
import { Cookbook } from '../models/Cookbook';
import { Recipe } from '../models/Recipe';
import { ChefBeginner } from '../models/ChefBeginner';
import { User } from '../models/User';

export class BookmarkRepository extends GenericRepository<Bookmark> {
  protected prismaModel = prisma.bookmark;

  private mapToBookmarkModel(prismaBookmark: any): Bookmark {
    let recipe: Recipe | undefined = undefined;
    if (prismaBookmark.recipe) {
      const chefBeginner = prismaBookmark.recipe.chefBeginner ? new ChefBeginner({
        id: prismaBookmark.recipe.chefBeginner.id,
        privileged_user: prismaBookmark.recipe.chefBeginner.privileged_user,
        userId: prismaBookmark.recipe.chefBeginner.userId,
        user: prismaBookmark.recipe.chefBeginner.user ? new User({
          id: prismaBookmark.recipe.chefBeginner.user.id,
          gender: prismaBookmark.recipe.chefBeginner.user.gender,
          first_name: prismaBookmark.recipe.chefBeginner.user.first_name,
          last_name: prismaBookmark.recipe.chefBeginner.user.last_name,
          phone_number: prismaBookmark.recipe.chefBeginner.user.phone_number,
          date_of_birth: prismaBookmark.recipe.chefBeginner.user.date_of_birth,
          createdAt: prismaBookmark.recipe.chefBeginner.user.createdAt,
          updatedAt: prismaBookmark.recipe.chefBeginner.user.updatedAt
        }) : undefined
      }) : undefined;

      recipe = new Recipe({
        id: prismaBookmark.recipe.id,
        title: prismaBookmark.recipe.title,
        preparation_time: prismaBookmark.recipe.preparation_time,
        heaviness: prismaBookmark.recipe.heaviness,
        category: prismaBookmark.recipe.category,
        number_of_views: prismaBookmark.recipe.number_of_views,
        number_of_portions: prismaBookmark.recipe.number_of_portions,
        createdAt: prismaBookmark.recipe.createdAt,
        updatedAt: prismaBookmark.recipe.updatedAt,
        chefBeginnerId: prismaBookmark.recipe.chefBeginnerId,
        chefBeginner: chefBeginner
      });
    }

    let cookbook: Cookbook | undefined = undefined;
    if (prismaBookmark.cookbook) {
      const cookbookChefBeginner = prismaBookmark.cookbook.chefBeginner ? new ChefBeginner({
        id: prismaBookmark.cookbook.chefBeginner.id,
        privileged_user: prismaBookmark.cookbook.chefBeginner.privileged_user,
        userId: prismaBookmark.cookbook.chefBeginner.userId,
        user: prismaBookmark.cookbook.chefBeginner.user ? new User({
          id: prismaBookmark.cookbook.chefBeginner.user.id,
          gender: prismaBookmark.cookbook.chefBeginner.user.gender,
          first_name: prismaBookmark.cookbook.chefBeginner.user.first_name,
          last_name: prismaBookmark.cookbook.chefBeginner.user.last_name,
          phone_number: prismaBookmark.cookbook.chefBeginner.user.phone_number,
          date_of_birth: prismaBookmark.cookbook.chefBeginner.user.date_of_birth,
          createdAt: prismaBookmark.cookbook.chefBeginner.user.createdAt,
          updatedAt: prismaBookmark.cookbook.chefBeginner.user.updatedAt
        }) : undefined
      }) : undefined;

      cookbook = new Cookbook({
        id: prismaBookmark.cookbook.id,
        title: prismaBookmark.cookbook.title,
        description: prismaBookmark.cookbook.description,
        chefBeginnerId: prismaBookmark.cookbook.chefBeginnerId,
        createdAt: prismaBookmark.cookbook.createdAt,
        updatedAt: prismaBookmark.cookbook.updatedAt,
        chefBeginner: cookbookChefBeginner,
        bookmarks: []
      });
    }

    return new Bookmark({
      id: prismaBookmark.id,
      title: prismaBookmark.title,
      recipeId: prismaBookmark.recipeId,
      cookbookId: prismaBookmark.cookbookId,
      createdAt: prismaBookmark.createdAt,
      updatedAt: prismaBookmark.updatedAt,
      recipe: recipe,
      cookbook: cookbook ? [cookbook] : undefined 
    });
  }
  private mapToCookbookModel(prismaCookbook: any): Cookbook {
    const bookmarks = prismaCookbook.bookmarks?.map((bookmark: any) => {
      const recipe = bookmark.recipe ? new Recipe({
        id: bookmark.recipe.id,
        title: bookmark.recipe.title,
        preparation_time: bookmark.recipe.preparation_time,
        heaviness: bookmark.recipe.heaviness,
        category: bookmark.recipe.category,
        number_of_views: bookmark.recipe.number_of_views,
        number_of_portions: bookmark.recipe.number_of_portions,
        createdAt: bookmark.recipe.createdAt,
        updatedAt: bookmark.recipe.updatedAt,
        chefBeginnerId: bookmark.recipe.chefBeginnerId,
        chefBeginner: bookmark.recipe.chefBeginner ? new ChefBeginner({
          id: bookmark.recipe.chefBeginner.id,
          privileged_user: bookmark.recipe.chefBeginner.privileged_user,
          userId: bookmark.recipe.chefBeginner.userId,
          user: bookmark.recipe.chefBeginner.user ? new User({
            id: bookmark.recipe.chefBeginner.user.id,
            first_name: bookmark.recipe.chefBeginner.user.first_name,
            last_name: bookmark.recipe.chefBeginner.user.last_name,
          }) : undefined
        }) : undefined
      }) : undefined;

      return new Bookmark({
        id: bookmark.id,
        title: bookmark.title,
        recipeId: bookmark.recipeId,
        cookbookId: bookmark.cookbookId,
        createdAt: bookmark.createdAt,
        updatedAt: bookmark.updatedAt,
        recipe: recipe 
      });
    }) || [];

    const chefBeginner = prismaCookbook.chefBeginner ? new ChefBeginner({
      id: prismaCookbook.chefBeginner.id,
      privileged_user: prismaCookbook.chefBeginner.privileged_user,
      userId: prismaCookbook.chefBeginner.userId,
      user: prismaCookbook.chefBeginner.user ? new User({
        id: prismaCookbook.chefBeginner.user.id,
        first_name: prismaCookbook.chefBeginner.user.first_name,
        last_name: prismaCookbook.chefBeginner.user.last_name,
        // dodajte ostala polja po potrebi
      }) : undefined
    }) : undefined;

    return new Cookbook({
      id: prismaCookbook.id,
      title: prismaCookbook.title,
      description: prismaCookbook.description,
      chefBeginnerId: prismaCookbook.chefBeginnerId,
      createdAt: prismaCookbook.createdAt,
      updatedAt: prismaCookbook.updatedAt,
      chefBeginner: chefBeginner,
      bookmarks: bookmarks
    });
  }

  // Osnovne CRUD operacije za Bookmark
  async getAll(): Promise<Bookmark[]> {
    const bookmarks = await this.prismaModel.findMany({
      include: {
        cookbook: {
          include: {
            chefBeginner: true
          }
        },
        recipe: {
          include: {
            chefBeginner: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });
    return bookmarks.map(bookmark => this.mapToBookmarkModel(bookmark));
  }

  async getById(id: number): Promise<Bookmark | null> {
    const bookmark = await this.prismaModel.findUnique({
      where: { id },
      include: {
        cookbook: {
          include: {
            chefBeginner: true
          }
        },
        recipe: {
          include: {
            chefBeginner: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });
    return bookmark ? this.mapToBookmarkModel(bookmark) : null;
  }

  async add(entity: Bookmark): Promise<void> {
    if (!entity.isValid()) {
      throw new Error('Invalid Bookmark entity');
    }

    await this.prismaModel.create({
      data: {
        title: entity.title,
        recipeId: entity.recipeId,
        cookbookId: entity.cookbookId
      }
    });
  }

  async update(entity: Bookmark): Promise<void> {
    if (!entity.isValid()) {
      throw new Error('Invalid Bookmark entity');
    }

    await this.prismaModel.update({
      where: { id: entity.id },
      data: {
        title: entity.title,
        recipeId: entity.recipeId,
        cookbookId: entity.cookbookId,
        updatedAt: new Date()
      }
    });
  }

  async delete(id: number): Promise<void> {
    await this.prismaModel.delete({
      where: { id }
    });
  }

  async findByChefBeginnerId(chefBeginnerId: number): Promise<Bookmark[]> {
    const bookmarks = await this.prismaModel.findMany({
      where: { 
        cookbook: { chefBeginnerId } 
      },
      include: {
        cookbook: {
          include: {
            chefBeginner: true
          }
        },
        recipe: {
          include: {
            chefBeginner: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return bookmarks.map(bookmark => this.mapToBookmarkModel(bookmark));
  }

  async findByRecipeId(recipeId: number): Promise<Bookmark[]> {
    const bookmarks = await this.prismaModel.findMany({
      where: { recipeId },
      include: {
        cookbook: {
          include: {
            chefBeginner: true
          }
        },
        recipe: {
          include: {
            chefBeginner: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });
    return bookmarks.map(bookmark => this.mapToBookmarkModel(bookmark));
  }

  async findByChefAndRecipe(chefBeginnerId: number, recipeId: number): Promise<Bookmark[] | null> {
    const bookmarks = await this.prismaModel.findMany({
      where: {
        recipeId: recipeId,
        cookbook: {
          chefBeginnerId: chefBeginnerId
        }
      },
      include: {
        cookbook: {
          include: {
            chefBeginner: true
          }
        },
        recipe: {
          include: {
            chefBeginner: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    return bookmarks.map(bookmark => this.mapToBookmarkModel(bookmark));
  }

  async findByChefRecipeAndCookbook(chefBeginnerId: number, recipeId: number, cookbookId: number): Promise<Bookmark | null> {
    const bookmarks = await this.prismaModel.findMany({
      where: {
        recipeId: recipeId,
        cookbookId: cookbookId,
        cookbook: {
          chefBeginnerId: chefBeginnerId
        }
      },
      include: {
        cookbook: {
          include: {
            chefBeginner: true
          }
        },
        recipe: {
          include: {
            chefBeginner: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });
    
    return bookmarks.length > 0 ? this.mapToBookmarkModel(bookmarks[0]) : null;
  }

  async getCookbooksByChefBeginnerId(chefBeginnerId: number): Promise<Cookbook[]> {
    const cookbooks = await prisma.cookbook.findMany({
      where: {
        chefBeginnerId: chefBeginnerId
      },
      include: {
        chefBeginner: {
          include: {
            user: true
          }
        },
        bookmarks: {
          include: {
            recipe: {
              include: {
                chefBeginner: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        first_name: true,
                        last_name: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    return cookbooks.map(cookbook => this.mapToCookbookModel(cookbook));
  }

  async getCookbookById(cookbookId: number): Promise<Cookbook | null> {
    const cookbook = await prisma.cookbook.findUnique({
      where: { id: cookbookId },
      include: {
        chefBeginner: {
          include: {
            user: true
          }
        },
        bookmarks: {
          include: {
            recipe: {
              include: {
                chefBeginner: {
                  include: {
                    user: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    return cookbook ? this.mapToCookbookModel(cookbook) : null;
  }

  async createCookbook(cookbookData: { title: string; description: string; chefBeginnerId: number }): Promise<Cookbook> {
    const cookbook = await prisma.cookbook.create({
      data: {
        title: cookbookData.title,
        description: cookbookData.description,
        chefBeginnerId: cookbookData.chefBeginnerId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        chefBeginner: true,
        bookmarks: true
      }
    });

    return this.mapToCookbookModel(cookbook);
  }

  async updateCookbook(cookbookId: number, cookbookData: { title?: string; description?: string }): Promise<Cookbook> {
    const cookbook = await prisma.cookbook.update({
      where: { id: cookbookId },
      data: {
        ...cookbookData,
        updatedAt: new Date()
      },
      include: {
        chefBeginner: true,
        bookmarks: {
          include: {
            recipe: true
          }
        }
      }
    });

    return this.mapToCookbookModel(cookbook);
  }

  async deleteCookbook(cookbookId: number): Promise<void> {
    await prisma.cookbook.delete({
      where: { id: cookbookId }
    });
  }
  async getBookmarksByCookbook(cookbookId: number): Promise<Bookmark[]> {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        cookbookId: cookbookId
      },
      include: {
        recipe: {
          include: {
            chefBeginner: {
              include: {
                user: true
              }
            }
          }
        },
        cookbook: true
      },
      orderBy: {
        createdAt: 'desc' 
      }
    });

    return bookmarks.map(bookmark => this.mapToBookmarkModel(bookmark));
  }
  async bookmarkRecipe(recipeId: number, cookbookId: number, title?: string): Promise<Bookmark> {
    const numericRecipeId = Number(recipeId);
    const numericCookbookId = Number(cookbookId);

    const recipe = await prisma.recipe.findUnique({
      where: { id: numericRecipeId }
    });
    
    if (!recipe) {
      throw new Error('Recept nije pronađen');
    }

    const cookbook = await prisma.cookbook.findUnique({
      where: { id: numericCookbookId }
    });

    if (!cookbook) {
      throw new Error('Cookbook nije pronađen');
    }

    const existingBookmark = await this.prismaModel.findFirst({
      where: {
        recipeId: numericRecipeId,
        cookbookId: numericCookbookId
      },
    });

    if (existingBookmark) {
      console.log(`Recept ${numericRecipeId} je već u cookbooku ${numericCookbookId}`);
      return this.mapToBookmarkModel(existingBookmark);
    }

    const bookmark = await this.prismaModel.create({
      data: {
        title: title || `Bookmark za ${recipe.title}`,
        recipeId: numericRecipeId,
        cookbookId: numericCookbookId
      },
      include: {
        cookbook: true,
        recipe: true
      }
    });

    return this.mapToBookmarkModel(bookmark);
  }

  async bookmarkRecipeInMultipleCookbooks(recipeId: number, cookbookIds: number[], title?: string): Promise<Bookmark[]> {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId }
    });
    
    if (!recipe) {
      throw new Error('Recept nije pronađen');
    }

    const bookmarks: Bookmark[] = [];

    for (const cookbookId of cookbookIds) {
      const cookbook = await prisma.cookbook.findUnique({
        where: { id: cookbookId }
      });

      if (!cookbook) {
        throw new Error(`Cookbook sa ID ${cookbookId} nije pronađen`);
      }

      const existingBookmark = await this.prismaModel.findFirst({
        where: {
          recipeId: recipeId,
          cookbookId: cookbookId
        }
      });

      if (!existingBookmark) {
        const bookmark = await this.prismaModel.create({
          data: {
            title: title || `Bookmark za ${recipe.title}`,
            recipeId: recipeId,
            cookbookId: cookbookId
          },
          include: {
            cookbook: true,
            recipe: true
          }
        });

        bookmarks.push(this.mapToBookmarkModel(bookmark));
      }
    }

    return bookmarks;
  }

  async deleteByChefAndRecipe(chefBeginnerId: number, recipeId: number): Promise<void> {
    await this.prismaModel.deleteMany({
      where: {
        recipeId: recipeId,
        cookbook: {
          chefBeginnerId: chefBeginnerId
        }
      }
    });	
  }

  async deleteByCookbookAndRecipe(cookbookId: number, recipeId: number): Promise<void> {
    await this.prismaModel.deleteMany({
      where: {
        cookbookId: cookbookId,
        recipeId: recipeId
      }
    });
  }

  async findByExpression(expression: any): Promise<Bookmark[]> {
    const bookmarks = await this.prismaModel.findMany({
      where: expression,
      include: {
        cookbook: {
          include: {
            chefBeginner: true
          }
        },
        recipe: {
          include: {
            chefBeginner: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });
    return bookmarks.map(bookmark => this.mapToBookmarkModel(bookmark));
  }
}