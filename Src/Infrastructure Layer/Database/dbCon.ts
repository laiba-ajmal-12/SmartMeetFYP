import {PrismaClient as PostSQLClient} from "../../../prisma/src/generated/prisma/PostSQL";

class PostSQLClinet{
      private static postSql :PostSQLClient
      private constructor(){}
      public static getClient():PostSQLClient{
            if(!this.postSql) {
                this.postSql = new PostSQLClient();
            }
            return this.postSql;
      }
      public static async closeConnection():Promise<void>{
        if(this.postSql){
            this.postSql.$disconnect();
        }
      }
      public static removeInstance():void{
        this.postSql = undefined!;
      }
}

export default PostSQLClinet;