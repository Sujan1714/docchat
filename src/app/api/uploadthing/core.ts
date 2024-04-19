import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

import { PDFLoader} from 'langchain/document_loaders/fs/pdf'
import {OpenAIEmbeddings} from "langchain/embeddings/openai"
import {PineconeStore} from "@langchain/pinecone"
import { pinecone } from "@/lib/pinecone";


const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {

      const { getUser } = getKindeServerSession()
      const user = await getUser()

      if (!user || !user.id) throw new Error("Unautherized")

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://utfs.io/f/${file.key}`,
          uploadStatus: "SUCCESS",
        },
      })

      try {
        const response = await fetch (`https://utfs.io/f/${file.key}`)
        
        console.log('got  file')
        const blob = await response.blob()

        const loader = new PDFLoader(blob)

        const pageLevelDocs = await loader.load()
        const pagesAmt = pageLevelDocs.length

        
        const pineconeIndex = pinecone.Index('docchat')

        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        })

        await PineconeStore.fromDocuments(
          pageLevelDocs,
          embeddings, {
          pineconeIndex,
          namespace: createdFile.id,
        }
      )

      await db.file.update({
        data: {
          uploadStatus: "SUCCESS"
        },
        where:{
          id:createdFile.id
        },
      })

      } catch (err) {
        await db.file.update({
          data: {
            uploadStatus: "SUCCESS"
          },
          where:{
            id:createdFile.id
          },
        })
        
      }


    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;