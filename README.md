# TODO List Application

This is a full-stack TODO list management application that allows users to efficiently manage their tasks with the following features:

- **Add** new TODO items
- **Mark** TODO items as done
- **Remove** TODO items from the list

## Architecture

The project consists of:

- **Backend**: Node.js/Express API server
- **Frontend**: React web application
- **Database**: MongoDB for data persistence

## Deployment Options

This application can be deployed in multiple environments:

### Local Development
- **Docker Compose**: Run the entire stack locally using Docker containers
- **Minikube**: Deploy to a local Kubernetes cluster for development and testing

### Cloud Deployment
- **Amazon EKS**: Production deployment on AWS Elastic Kubernetes Service cluster

## Getting Started

Befor you do any further step, make sure that your code can run sucessfully on docker-compose.
- Step 1: Navigate to `frontend` folder, find `package.json_local` and copy line No 30 to file `package.json`  
 ```"proxy": "http://backend:3000"```  
 *Make sure to correct Json format.
- Step 2: Navigate to root level of this repository and run:
`docker-compose up -d`
- Step 3: Open browser `localhowst:3000` to test the app.
- Step 4: Now your app is ready to deploy to any environment like Minikube, EKS or Kubernetes.
- Step 5: Remove line 30 in `package.json` to avoid proxy error when deploy to K8s, EKS.
- Step 6: [Optional] Remove DockerCompose resources by running `docker-compose down --volumes`

## Deploy to minikube on local
- Step 1: Start minikube
```minikube start --cpus=4 --memory=4096```  
Check Minikube status by running command:  
```kubectl get nodes```  
Expected result:
```
$ kubectl get nodes
NAME       STATUS   ROLES           AGE     VERSION
minikube   Ready    control-plane   5m48s   v1.27.4
```
- Step 2: Configure your shell to use Minikube's Docker daemon. Reason: you need to build Docker image in the way that Minikube can access those Images.
`eval $(minikube docker-env)`
Verify you're using Minikube's Docker
`docker images | grep minikube`  

- Step 3: Build docker image for Backend and Frontend.
`docker build -t todo-app-backend:v0.0.1 ./backend`  
`docker build -t todo-app-frontend:v0.0.1 ./frontend`  
Check docker images:
`docker images | grep todo-app`
- Step 3: Apply Kubenetes config by running below command:  
`kubectl apply -f minikube-local.yaml`

- Step 4: Check running pods:
`kubectl get pods`
Expected result:  
```
$ kubectl get pods
NAME                                   READY   STATUS    RESTARTS   AGE
backend-deployment-54f69b9667-8nsrh    1/1     Running   0          7m41s
backend-deployment-54f69b9667-g6kzh    1/1     Running   0          3m34s
frontend-deployment-5fb7bf874f-hzh4t   1/1     Running   0          3m32s
frontend-deployment-5fb7bf874f-tbrkv   1/1     Running   0          7m41s
mongo-deployment-56b959dd89-26bcz      1/1     Running   0          26m
```

- Step 5: Check running Services:
`kubectl get services`  
Expected result:  
```
$ kubectl get services
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
backend      NodePort    10.104.3.245    <none>        3000:30099/TCP   27m
frontend     NodePort    10.110.95.129   <none>        3000:30088/TCP   27m
kubernetes   ClusterIP   10.96.0.1       <none>        443/TCP          35m
mongo        ClusterIP   10.111.83.161   <none>        27017/TCP        27m
```

- Step 6: access the Application via NGINX Ingress:  
`minikube addons list | grep ingress`  
Enable addon if not enabled:  
`minikube addons enable ingress`  
Open seperate Terminal and type:
`minikube tunnel`
Keep terminal running then access address, example:  
http://localhost  
Try to add, mark Done and Delete some TODO item.


## Deploy to AWS EKS  
On AWS EKS, we will not use NGINX for ingress. Instead we will use `AWS ALB Ingress Controller`.

- Step 1: Build and push docker image to Elastic Container Registry (ECR)  
    - Create two repository example `todo-frontend` and `todo-backend`
    - Build and push image to ECR Repositories. *See ECS Section.
- Step 2: Create an EKS Cluster. *See EKS Section.  
Configuration: Node type: t3.small, number of nodes: 2

    ```
    eksctl create cluster --name devops-test-cluster --region ap-southeast-1 --nodegroup-name my-nodes --node-type t3.medium --nodes 2 --nodes-min 2 --nodes-max 4 --managed
    ```
- Step 3: Run below command to update Cluster config ~/.kube/config (For windows is: C:\Users\{username}\.kube\config)  
    - `aws eks update-kubeconfig --region ap-southeast-1 --name devops-test-cluster`
    - Check context:  
    - `kubectl config get-contexts`
    - [Optional] Set context incase you have more than 1 context and it not correct.
    - `kubectl config use-context devops-test-cluster`
    - Check again:
    `kubectl cluster-info`
    - Result:
        ```
        Kubernetes control plane is running at https://<8945378295HFEHFJRHEIWUO7549283>.gr7.ap-southeast-1.eks.amazonaws.com
        CoreDNS is running at https://<8945378295HFEHFJRHEIWUO7549283>.gr7.ap-southeast-1.eks.amazonaws.com/api/v1/
        ```
- Step 4: Install `AWS ALB Ingress Controller`
    - Follow guide below to install OIDC for cluster:  
      https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html
    - Follow guide below to install plugin ALB Ingress Controller:    
      https://docs.aws.amazon.com/eks/latest/userguide/lbc-helm.html

- Step 5: Modify configuration file  `aws-eks.yaml`
    - Modify frontend ECR repository image URI  
    - Modify backend ECR repository image URI

- Step 6: Apply configuration file  
    `kubectl apply -f aws-eks.yaml`

- Step 7: Verify created resources
    - Application Load Balancer
    - Target Group
- Step 8: Test access via Application Load Balancer
    - Troubleshoot connection issue by modify Security Group of ALB if needed.

