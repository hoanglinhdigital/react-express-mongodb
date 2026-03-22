# CI/CD Pipeline Guide for AWS EKS

This guide will walk you through implementing a complete CI/CD pipeline using AWS CodeCommit, CodeBuild, CodeDeploy, and CodePipeline to deploy your full-stack mono-repository (frontend & backend) to an AWS EKS (Elastic Kubernetes Service) cluster. 

Since your app already runs successfully on Minikube locally (`minikube-local.yaml`), we will replicate that structure but target EKS.

---

## 🏗️ Architecture Overview

1. **AWS CodeCommit**: Stores your monolithic source code repository `/frontend`, `/backend`, and configuration files (like `minikube-local.yaml` adapted for EKS).
2. **AWS CodeBuild**: Compiles the code, builds Docker images for both backend and frontend, and pushes them to Amazon ECR (Elastic Container Registry).
3. **AWS CodePipeline**: Orchestrates the workflow, detecting source code changes in CodeCommit and automatically triggering the build and deployment.
4. **Deploy Stage / AWS CodeDeploy**: While AWS CodeDeploy natively targets EC2, ECS, and Lambda, deployments to EKS through AWS CodePipeline are typically handled by defining a "Deploy" stage using an additional **CodeBuild** project that runs `kubectl apply` or uses a Helm chart to update the EKS cluster safely.

---

## 📌 Step 1: Source Control with AWS CodeCommit

Since you are using a **monorepo** approach, both `/frontend` and `/backend` will live in the same repository.

### Configuration Details:
1. Navigate to **AWS CodeCommit** in the AWS Console.
2. Click **Create repository**.
3. Name it `todo-app-monorepo` with a descriptive, optional description.
4. Clone the repository to your local machine:
   ```bash
   git clone https://git-codecommit.<region>.amazonaws.com/v1/repos/todo-app-monorepo
   ```
5. Move your existing files (`/frontend`, `/backend`, `minikube-local.yaml`) into this newly cloned repository directory.
6. Make a push to the main branch:
   ```bash
   git add .
   git commit -m "Initial commit for EKS deployment"
   git push origin main
   ```

---

## 📌 Step 2: Build & Push Images with AWS CodeBuild

You will need AWS Elastic Container Registry (ECR) repositories to hold the frontend and backend Docker images.
1. Create two ECR Repositories: `todo-frontend` and `todo-backend`.

Next, create a `buildspec.yml` file in the root of your repository to instruct CodeBuild on how to containerize and push the applications.

See `buildspec.yml` file for example.

*Make sure your CodeBuild IAM Role has the necessary permissions for ECR (`Action: ecr:*`).*

---

## 📌 Step 3: Deployment to EKS 

As mentioned, CodeDeploy doesn't provide a direct, native "EKS" deployment type out of the box in the same way it does for ECS. The industry standard practice inside AWS CodePipeline to deploy to EKS is to add a second **CodeBuild** project acting as the Deploy stage, or use a GitOps tool like ArgoCD.

### Option: CodeBuild Deploy Stage (acting as CodeDeploy)
Create a second `buildspec-deploy.yml` stored in your repository. This file will be executed by a separate CodeBuild project assigned in the continuous delivery stage.

*See buildspec-deploy.yml for example.


*Note:* You must attach an IAM Policy to this Deployment CodeBuild role granting `eks:DescribeCluster` and ensure it is added to the `aws-auth` ConfigMap in your EKS cluster with `system:masters` or appropriate RBAC permissions.

---

## 📌 Step 4: Orchestration with AWS CodePipeline

Lastly, tie the previous steps together using AWS CodePipeline.

1. Navigate to **CodePipeline** and click **Create Pipeline**.
2. **Name**: `todo-app-eks-pipeline`.
3. **Service Role**: Let it create a new service role.
4. **Source Stage**: 
   - Provider: **AWS CodeCommit**.
   - Repository: `todo-app-monorepo`.
   - Branch: `main`.
   - Output artifact format: `Full clone` *(Required to use git commands in CodeBuild)*.
5. **Build Stage**:
   - Provider: **AWS CodeBuild**.
   - Project name: Create a new project or select the one you made using `buildspec.yml`.
   - Be sure ECR environment variables (`AWS_ACCOUNT_ID`, `AWS_DEFAULT_REGION`) are set in the CodeBuild project.
6. **Deploy Stage**:
   - Provider: **AWS CodeBuild** (Choose the Deployment CodeBuild project you made for `buildspec-deploy.yml`). 
   - *If you absolutely must use CodeDeploy natively, it necessitates configuring a Lambda deployment type or an ECS blue/green controller acting on behalf of an EKS update, which adds unnecessary complexity. Using the dedicated CodeBuild Deploy Stage is native, simple, and the officially recommended AWS approach.*
   - Input Artifacts: Use the output artifact from the Build stage.
7. Click **Create** to initialize your pipeline. 

---

## 🎉 Success Validation
Once you commit to the Main branch, your CI/CD Pipeline will automatically trigger. You can validate the deployment in your EKS cluster with:
```bash
kubectl get deployments
kubectl get pods
kubectl get svc
```
Your Ingress or LoadBalancer will then route traffic to the newly spun-up Monorepo applications!
